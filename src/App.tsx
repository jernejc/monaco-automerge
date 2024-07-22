import React, { useEffect, useRef } from 'react';

import * as monaco from "monaco-editor";
import Editor, { OnChange, OnMount } from '@monaco-editor/react';

import { AutomergeUrl, DocHandle } from "@automerge/automerge-repo";
import { useDocument, useLocalAwareness, useRemoteAwareness } from '@automerge/automerge-repo-react-hooks';

import { cursorUpdate } from './monaco/cursorUpdate';
import { selectionUpdate } from './monaco/selectionUpdate';

import { State } from "./types";

export default function App({ url, handle, userId }: { url: AutomergeUrl, handle: DocHandle<State>, userId: string }) {
  const editorRef = useRef<any>(null);

  const [doc, changeDoc] = useDocument<State>(url);

  const [localState, updateLocalState] = useLocalAwareness({
    handle,
    userId: userId,
    initialState: {},
  });

  const [peerStates] = useRemoteAwareness({
    handle,
    localUserId: userId,
  });

  const handleEditorChange: OnChange = (value: string | undefined) => {
    changeDoc((current) => {
      current.text = value || '';
    });
  };

  const handleEditorMount: OnMount = (editor: monaco.editor.ICodeEditor) => {
    editorRef.current = editor;

    if (editorRef.current) {
      editorRef.current.onDidChangeCursorPosition(() => {
        const position: monaco.IPosition = editorRef.current.getPosition();
        updateLocalState(state => ({ ...state, position }));
      });

      editorRef.current.onDidChangeCursorSelection(() => {
        const selection: monaco.ISelection = editorRef.current.getSelection();
        updateLocalState(state => ({ ...state, selection }));
      });
    }
  }

  useEffect(() => {
    if (peerStates && editorRef.current) {
      for (let peer in peerStates) {
        const { position, selection } = peerStates[peer];

        if (position) {
          cursorUpdate(editorRef.current, position, peer)
        } if (selection) {
          const start: monaco.IPosition = {
            column: selection.startColumn,
            lineNumber: selection.startLineNumber
          }

          const end: monaco.IPosition = {
            column: selection.endColumn,
            lineNumber: selection.endLineNumber
          }

          selectionUpdate(editorRef.current, start, end, peer)
        }
      }
    }
  }, [peerStates]);

  /*useEffect(() => {
    console.log('useEffect localState', localState);
  }, [localState]);*/

  return (
    <div className='bg-neutral-800 w-full h-full'>
      <Editor
        className='py-4'
        height="100vh"
        defaultLanguage="javascript"
        defaultValue="// type your code... \n"
        theme='vs-dark'
        value={doc?.text}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
      />
    </div>
  );
}
