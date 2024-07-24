import { useEffect, useReducer, useRef } from "react";

import { editor, IPosition, Selection } from "monaco-editor";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";

import { DocHandle } from "@automerge/automerge-repo";
import { updateText } from '@automerge/automerge/next';
import { useDocument, useLocalAwareness, useRemoteAwareness } from "@automerge/automerge-repo-react-hooks";

import { SelectionActionType, selectionReducer } from "../../reducers/selectionReducer";
import { WidgetActionType, widgetsReducer } from "../../reducers/widgetsReducer";
import { ContentActionType, editorContentReducer } from "../../reducers/editorContentReducer";

import { CircularSpinner } from "./CircularSpinner";

import { Document, User } from "../../types";

export function MonacoEditor({ handle, user }: { handle: DocHandle<Document>, user: User }) {

  const editorRef = useRef<any>(null);
  const suspense = useRef<boolean>(false);
  const head = useRef<string>('');

  const [doc, changeDoc] = useDocument<Document>(handle.url);

  const [widgets, dispatchWidgets] = useReducer(widgetsReducer, []);
  const [selections, dispatchSelections] = useReducer(selectionReducer, []);
  const [editorContent, dispatchEditorContent] = useReducer(editorContentReducer, '');

  const [localState, updateLocalState] = useLocalAwareness({
    handle,
    userId: user.id,
    initialState: {},
  });

  const [peerStates] = useRemoteAwareness({
    handle,
    localUserId: user.id,
  });

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

  const handleEditorChange: OnChange = (value: string | undefined) => {
    if (suspense.current) {
      suspense.current = false;
      return
    }

    if (!value) return;

    changeDoc(doc => updateText(doc, ['text'], value));

    suspense.current = true;
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
  }, [peerStates]);

  useEffect(() => {
    if (doc) {
      const metaSymbol = Object.getOwnPropertySymbols(doc).find(
        (s) => doc[s].mostRecentPatch
      );

      if (metaSymbol === undefined) return;

      const metaData = doc[metaSymbol];

      if (metaData.mostRecentPatch.patches.length === 0) return;

      const firstPatch = metaData.mostRecentPatch.patches[0]

      if (head.current === metaData.mostRecentPatch.after[0])
        return;

      head.current = metaData.mostRecentPatch.after[0];

      if (suspense.current) {
        suspense.current = false;
        return
      }

      if (firstPatch.action === ContentActionType.PUT && metaData.mostRecentPatch.patches.length === 1)
        return;

      if (firstPatch.action === ContentActionType.PUT && metaData.mostRecentPatch.patches.length > 1) {
        const slicePatch = metaData.mostRecentPatch.patches[1]

        suspense.current = true;

        dispatchEditorContent({
          type: ContentActionType.REPLACE,
          editor: editorRef.current,
          user,
          index: slicePatch.path[1],
          value: slicePatch.value
        });

        return;
      }

      metaData.mostRecentPatch.patches.forEach((patch: any) => {
        if (patch.action === ContentActionType.PUT) return;

        if (patch.action !== ContentActionType.DEL)
          suspense.current = true;

        dispatchEditorContent({
          type: ContentActionType[patch.action.toUpperCase()],
          editor: editorRef.current,
          user,
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
        defaultLanguage="javascript"
        defaultValue="// type your code... "
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