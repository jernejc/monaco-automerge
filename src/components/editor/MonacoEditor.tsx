import { useEffect, useReducer, useRef } from "react";

import { editor, IPosition, Selection } from "monaco-editor";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";

import { DocHandle } from "@automerge/automerge-repo";
import { updateText } from "@automerge/automerge/next";
import { useDocument, useLocalAwareness, useRemoteAwareness } from "@automerge/automerge-repo-react-hooks";

import { SelectionActionType, selectionReducer } from "../../reducers/selectionReducer";
import { WidgetActionType, widgetsReducer } from "../../reducers/widgetsReducer";
import { ContentActionType, editorContentReducer } from "../../reducers/editorContentReducer";

import { Document, User, ChangeMeta } from "../../types";

import { removeEventLog, addEventLog, EventLogType } from "../../helpers/eventLog";
import { getChangeMeta } from "../../helpers/automerge/getChangeMeta";

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
  const editEvents = useRef<EventLogType[]>([]);

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
    if (removeEventLog(editEvents.current, EventLogType.REMOTE)) return;
    if (ev.isFlush) return;
    if (value === undefined) return;

    changeDoc(doc => updateText(doc, ["text"], value));

    addEventLog(editEvents.current, EventLogType.LOCAL);
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
          });
        }
        if (selection) {
          dispatchSelections({
            type: SelectionActionType.UPSERT,
            user,
            selection,
            editor: editorRef.current
          });
        }
      }
    }

    dispatchWidgets({
      type: WidgetActionType.CLEAR_UNACTIVE,
      activePeers: Object.keys(peerStates)
    });
  }, [peerStates]);

  useEffect(() => {
    if (removeEventLog(editEvents.current, EventLogType.LOCAL))
      return;

    if (doc && editorRef.current) {
      const currentText: string = editorRef.current.getValue();

      if (currentText === doc.text) return;

      const changeMeta: ChangeMeta | null = getChangeMeta(doc);

      if (!changeMeta) return;
      if (head === changeMeta?.head) return;
      if (changeMeta?.patches.length === 0) return;
      
      changeMeta.patches.forEach((patch: any) => {
        if (patch.action === ContentActionType.PUT) return; // PUT events are empty
        if (patch.action === ContentActionType.DEL && !patch.length) // DEL events with no length are actually length 1
          patch.length = 1;

        // @ts-ignore
        let actionType: ContentActionType = ContentActionType[patch.action.toUpperCase()];

        if (!head && ContentActionType.SPLICE) // use replace on init
          actionType = ContentActionType.REPLACE

        dispatchEditorContent({
          type: actionType,
          editor: editorRef.current,
          user,
          events: editEvents.current,
          head: changeMeta.head,
          index: patch.path[1],
          value: patch.value,
          length: patch.length
        });
      });
    }
  }, [doc]);

  // cleanup
  useEffect(() => {
    return () => {
      updateLocalState((state: any) => ({ ...state, selection: null, user: null }));

      if (editorRef.current)
        editorRef.current.dispose();
    }
  }, []);

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