import { useEffect, useReducer, useRef } from 'react';

import { editor, IPosition, Selection } from "monaco-editor";
import Editor, { OnChange, OnMount } from '@monaco-editor/react';

import { AutomergeUrl, DocHandle } from "@automerge/automerge-repo";
import { useDocument, useLocalAwareness, useRemoteAwareness, useRepo } from '@automerge/automerge-repo-react-hooks';

import { selectionReducer } from '../../reducers/selectionReducer';
import { widgetsReducer } from '../../reducers/widgetsReducer';

import { State, User } from "../../types";

export function MonacoEditor({ url, handle, user }: { url: AutomergeUrl, handle: DocHandle<State>, user: User }) {
  const editorRef = useRef<any>(null);

  const [doc, changeDoc] = useDocument<State>(url);

  const [widgets, dispatchWidgets] = useReducer(widgetsReducer, []);
  const [selections, dispatchSelections] = useReducer(selectionReducer, []);

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
    changeDoc((current) => {
      current.text = value || '';
    });
  };

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
            type: 'upsert',
            user,
            position,
            editor: editorRef.current
          })
        }
        if (selection) {
          dispatchSelections({
            type: 'upsert',
            user,
            selection,
            editor: editorRef.current
          })
        }
      }
    }
  }, [peerStates]);

  useEffect(() => {
    if (editorRef.current) {
      updateLocalPosition(editorRef.current);
    }
  }, [doc]);

  return (
    <div className='w-full h-full'>
      <Editor
        className='h-[calc(100vh-4rem)]'
        defaultLanguage="javascript"
        defaultValue="// type your code... "
        theme='vs-dark'
        value={doc?.text}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
      />
    </div>
  );
}