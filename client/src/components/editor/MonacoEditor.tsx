import { useEffect, useRef } from "react";
import { useRouteLoaderData, useParams, Outlet } from "react-router-dom";

import { editor, Position, Selection } from "monaco-editor";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";

import { DocHandle, updateText } from "@automerge/automerge-repo";
import { useDocument, useLocalAwareness, useRemoteAwareness } from "@automerge/automerge-repo-react-hooks";

import { Document, User, ChangeMeta, Peer, ChangePatch, PayloadType, EventLogType } from "../../types";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { executeEdit, widgetUpdate, selectionUpdate, addEventLog, removeEventLog, eventLogLocal, eventLogRemote } from "../../redux/editorSlice";

import { getChangeMeta } from "../../helpers/automerge/getChangeMeta";
import { getActivePeers } from "../../helpers/automerge/getActivePeers";

import { CircularSpinner } from "./CircularSpinner";

import { config } from "../../config";


export function MonacoEditor() {

  const { changeId } = useParams<"changeId">() as { changeId: string };
  const { user, handle } = useRouteLoaderData("root") as { user: User, handle: DocHandle<Document> };

  const dispatch = useAppDispatch()

  const eventsLocal = useAppSelector(eventLogLocal);
  const eventsRemote = useAppSelector(eventLogRemote);

  const [doc, changeDoc] = useDocument<Document>(handle.url);

  const [localState, updateLocalState] = useLocalAwareness({
    handle,
    userId: user.id,
    initialState: {},
    heartbeatTime: 5000
  });

  const [peerStates, heartbeats] = useRemoteAwareness({
    handle,
    localUserId: user.id,
    offlineTimeout: config.defaults.activePeerTimeout
  });

  const editorRef = useRef<any>(null);

  const updateLocalPosition = (editor: editor.ICodeEditor) => {
    const position: Position | null = editor.getPosition();

    if (!position) return updateLocalState((state: any) => ({ ...state, position: null, user }));

    updateLocalState((state: any) => ({ ...state, position, user }));
  }

  const updateLocalSelection = (editor: editor.ICodeEditor) => {
    const selection: Selection | null = editor.getSelection();

    if (!selection) return updateLocalState((state: any) => ({ ...state, selection: null, user }));

    updateLocalState((state: any) => ({ ...state, selection, user }));
  }

  const handleEditorChange: OnChange = (value: string | undefined, ev: editor.IModelContentChangedEvent) => {
    if (eventsRemote.length > 0) {
      dispatch(removeEventLog(EventLogType.REMOTE));
      return;
    }

    if (ev.isFlush) return;
    if (value === undefined) return;

    changeDoc(doc => updateText(doc, ["text"], value));

    dispatch(addEventLog(EventLogType.LOCAL));
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

  const clearUnactivePeers = (activePeers?: Peer[]) => {
    dispatch(widgetUpdate({
      type: PayloadType.CLEAR_UNACTIVE,
      activePeers: activePeers || []
    }));
    dispatch(selectionUpdate({
      type: PayloadType.CLEAR_UNACTIVE,
      activePeers: activePeers || []
    }));
  }

  useEffect(() => {
    if (peerStates && editorRef.current) {
      const activePeers: Peer[] = getActivePeers(peerStates, heartbeats);

      activePeers.forEach((peer: Peer) => {
        const { user, position, selection } = peer;

        if (position) {
          dispatch(widgetUpdate({
            type: PayloadType.UPSERT,
            user,
            position,
            editor: editorRef.current
          }));
        }
        if (selection) {
          dispatch(selectionUpdate({
            type: PayloadType.UPSERT,
            user,
            selection,
            editor: editorRef.current
          }));
        }
      });

      clearUnactivePeers(activePeers);
    } else {
      clearUnactivePeers();
    }
  }, [peerStates, heartbeats]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      clearUnactivePeers();
    }, config.defaults.activePeerTimeout);

    return () => clearTimeout(timeoutId);
  }, [heartbeats]);

  useEffect(() => {
    if (eventsLocal.length > 0) {
      dispatch(removeEventLog(EventLogType.LOCAL));
      return
    }

    if (doc && editorRef.current) {
      const changeMeta: ChangeMeta | null = getChangeMeta(doc);

      if (doc.text === editorRef.current.getValue()) return;
      if (!changeMeta || changeMeta.patches.length === 0) return;

      changeMeta.patches.forEach((patch: ChangePatch) => {
        dispatch(executeEdit({
          user,
          type: patch.actionType,
          editor: editorRef.current,
          head: changeMeta.head,
          index: patch.path[1] as number,
          value: patch.value,
          length: patch.length
        }));
      });
    }
  }, [doc, editorRef.current]);

  return (
    <>
      <Outlet />

      <div className={`w-full h-full min-h-[calc(100vh-4rem)] ${changeId ? "hidden" : "flex"}`}>
        <Editor
          className="w-full h-full min-h-[calc(100vh-4rem)] grow"
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
    </>
  );
}