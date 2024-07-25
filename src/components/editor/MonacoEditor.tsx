import { useEffect, useReducer, useRef } from "react";

import { editor, IPosition, Selection } from "monaco-editor";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";

import { DocHandle, Patch } from "@automerge/automerge-repo";
import { updateText } from "@automerge/automerge/next";
import { useDocument, useLocalAwareness, useRemoteAwareness } from "@automerge/automerge-repo-react-hooks";

import { SelectionActionType, selectionReducer } from "../../reducers/selectionReducer";
import { WidgetActionType, widgetsReducer } from "../../reducers/widgetsReducer";
import { ContentActionType, editorContentReducer } from "../../reducers/editorContentReducer";

import { Document, User } from "../../types";
import { removeEventLog } from "../../helpers/monaco/removeEventLog";

import { CircularSpinner } from "./CircularSpinner";

export function MonacoEditor({ user, handle }: { user: User, handle: DocHandle<Document> }) {

  const [doc, changeDoc] = useDocument<Document>(handle?.url);
  const [localState, updateLocalState] = useLocalAwareness({
    handle,
    userId: user.id,
    initialState: {},
    heartbeatTime: 5000
  });

  const [peerStates] = useRemoteAwareness({
    handle,
    localUserId: user.id,
    offlineTimeout: 10000
  });

  const editorRef = useRef<any>(null);
  const editEvents = useRef<string[]>([]);

  const [widgets, dispatchWidgets] = useReducer(widgetsReducer, []);
  const [selections, dispatchSelections] = useReducer(selectionReducer, []);
  const [head, dispatchEditorContent] = useReducer(editorContentReducer, "");

  const updateLocalPosition = (editor: editor.ICodeEditor) => {
    const position: IPosition | null = editor.getPosition();

    if (!position) return;

    updateLocalState((state: any) => ({ ...state, position, user }));
  }

  const updateLocalSelection = (editor: editor.ICodeEditor) => {
    const selection: Selection | null = editor.getSelection();

    if (!selection) return updateLocalState((state: any) => ({ ...state, selection: null, user }));

    updateLocalState((state: any) => ({ ...state, selection, user }));
  }

  const handleEditorChange: OnChange = (value: string | undefined, ev: editor.IModelContentChangedEvent) => {
    if (removeEventLog(editEvents.current, "remote")) return

    if (ev.isFlush) return;
    if (value === undefined) return;

    changeDoc(doc => updateText(doc, ["text"], value));
    editEvents.current.push("local");
  }

  const handleEditorMount: OnMount = (editor: editor.ICodeEditor) => {
    editorRef.current = editor;

    if (editorRef.current) {
      updateLocalPosition(editorRef.current);

      editorRef.current.onDidChangeCursorPosition(() => {
        updateLocalPosition(editorRef.current);
      });

      editorRef.current.onDidChangeCursorSelection(() => {
        updateLocalSelection(editorRef.current);
      });
    }
  }

  useEffect(() => {   
    if (peerStates && editorRef.current) {
      for (let peer in peerStates) {
        const { position, selection, user } = peerStates[peer];

        if (position) {
          dispatchWidgets({
            type: WidgetActionType.UPSERT,
            user,
            position,
            editor: editorRef.current
          })
        }
        if (selection) {
          dispatchSelections({
            type: SelectionActionType.UPSERT,
            user,
            selection,
            editor: editorRef.current
          })
        }
      }
    }

    dispatchWidgets({
      type: WidgetActionType.CLEAR_UNACTIVE,
      activePeers: Object.keys(peerStates)
    });
  }, [peerStates]);

  useEffect(() => { // move this whole thing somewhere
    if (removeEventLog(editEvents.current, "local"))
      return

    if (doc && editorRef.current) {
      const currentText: string = editorRef.current.getValue();

      if (currentText === doc.text) return;

      const metaSymbol: symbol | undefined = Object.getOwnPropertySymbols(doc).find(
        // @ts-ignore
        (s) => doc[s].mostRecentPatch
      );

      if (metaSymbol === undefined) return;

      // @ts-ignore
      const metaData: any = doc[metaSymbol];
      const patches: Patch[] = metaData.mostRecentPatch?.patches;
      const afterHead: string = metaData.mostRecentPatch?.after[0];

      if (head === afterHead) return;
      if (patches?.length === 0) return;

      patches.forEach((patch: any) => {
        if (patch.action === ContentActionType.PUT) return; // PUT events are empty
        if (patch.action === ContentActionType.DEL && !patch.length) // DEL events with no length are actually length 1
          patch.length = 1;

        // @ts-ignore
        let actionType: ContentActionType = ContentActionType[patch.action.toUpperCase()];

        if (!head) // use replace on init
          actionType = ContentActionType.REPLACE

        dispatchEditorContent({
          type: actionType,
          editor: editorRef.current,
          user,
          events: editEvents.current,
          head: afterHead,
          index: patch.path[1],
          value: patch.value,
          length: patch.length
        });
      });
    }
  }, [doc]);

  return (
    <div className="flex w-full h-full min-h-[calc(100vh-4rem)]">
      <Editor
        className="min-h-[calc(100vh-4rem)] h-full grow"
        defaultLanguage="typescript"
        loading={<CircularSpinner />}
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          quickSuggestions: true,
          folding: false
        }}
      />
    </div>
  );
}