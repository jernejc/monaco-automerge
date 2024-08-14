import { useEffect, useRef } from "react";
import { useRouteLoaderData, useParams, Outlet } from "react-router-dom";

import { editor, Position, Selection } from "monaco-editor";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";

import { DocHandle, updateText } from "@automerge/automerge-repo";
import { useDocument, useLocalAwareness, useRemoteAwareness } from "@automerge/automerge-repo-react-hooks";

import { Document, ChangeMeta, Peer, ChangePatch, PayloadType, EventLogType } from "../../types";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { executeEdit, widgetUpdate, selectionUpdate, addEventLog, removeEventLog, getEventLogLocal, getEventLogRemote, getHead } from "../../redux/slices/editor";
import { getUser } from "../../redux/slices/user";

import { getRecentChangeMeta, getActivePeers } from "../../helpers/automerge";

import { CircularSpinner } from "./CircularSpinner";

import { config } from "../../config";


export function MonacoEditor() {

  const { changeId } = useParams<"changeId">() as { changeId: string };
  const { handle } = useRouteLoaderData("root") as { handle: DocHandle<Document> };

  const dispatch = useAppDispatch()

  const eventLogLocal = useAppSelector(getEventLogLocal);
  const eventLogRemote = useAppSelector(getEventLogRemote);
  const user = useAppSelector(getUser);
  const currentHead = useAppSelector(getHead);

  const [doc, changeDoc] = useDocument<Document>(handle.url);

  const [localState, updateLocalState] = useLocalAwareness({
    handle,
    userId: user.id,
    initialState: {},
    heartbeatTime: config.defaults.heartbeatTime
  });

  const [peerStates, heartbeats] = useRemoteAwareness({
    handle,
    localUserId: user.id,
    offlineTimeout: config.defaults.activePeerTimeout
  });

  const editorRef = useRef<any>(null);

  const updateLocalPosition = () => {
    const position: Position | null = editorRef.current.getPosition();

    if (!position) return updateLocalState((state: any) => ({ ...state, position: null, user }));

    updateLocalState((state: any) => ({ ...state, position, user }));
  }

  const updateLocalSelection = () => {
    const selection: Selection | null = editorRef.current.getSelection();

    if (!selection) return updateLocalState((state: any) => ({ ...state, selection: null, user }));

    updateLocalState((state: any) => ({ ...state, selection, user }));
  }

  const handleEditorChange: OnChange = (value: string | undefined, ev: editor.IModelContentChangedEvent) => {
    if (eventLogRemote.length > 0) {
      dispatch(removeEventLog(EventLogType.REMOTE));
      return;
    }

    if (ev.isFlush) return;
    if (value === undefined) return;

    dispatch(addEventLog(EventLogType.LOCAL));
    changeDoc(doc => updateText(doc, ["text"], value));
  }

  const handleEditorMount: OnMount = (editor: editor.ICodeEditor) => {
    editorRef.current = editor;

    if (editorRef.current) {
      updateLocalPosition();

      editorRef.current.onDidChangeCursorPosition(() => {
        updateLocalPosition();
      });

      editorRef.current.onDidChangeCursorSelection(() => {
        updateLocalSelection();
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
    if (eventLogLocal.length > 0) {
      dispatch(removeEventLog(EventLogType.LOCAL));
      return;
    }

    if (doc && editorRef.current) {
      const changeMeta: ChangeMeta | null = getRecentChangeMeta(doc);

      if (!changeMeta || changeMeta.patches.length === 0) return;
      if (doc.text === editorRef.current.getValue()) return;
      if (changeMeta.head === null || changeMeta.head === currentHead) return;

      changeMeta.patches.forEach((patch: ChangePatch) => {
        dispatch(executeEdit({
          user,
          editor: editorRef.current,
          head: changeMeta.head,
          ...patch
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