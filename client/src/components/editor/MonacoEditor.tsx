import { useEffect, useReducer, useRef } from "react";

import { editor, Position, Selection } from "monaco-editor";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";

import { DocHandle, Patch } from "@automerge/automerge-repo";
import { updateText } from "@automerge/automerge/next";
import { useDocument, useLocalAwareness, useRemoteAwareness } from "@automerge/automerge-repo-react-hooks";

import { SelectionActionType, selectionReducer } from "../../reducers/selectionReducer";
import { WidgetActionType, widgetsReducer } from "../../reducers/widgetsReducer";
import { ContentActionType, editorContentReducer } from "../../reducers/editorContentReducer";

import { Document, User, ChangeMeta, Preview, Peer } from "../../types";
import { config } from "../../config";

import { removeEventLog, addEventLog, EventLogType } from "../../helpers/eventLog";
import { getChangeMeta } from "../../helpers/automerge/getChangeMeta";
import { getActivePeers } from "../../helpers/automerge/getActivePeers";

import { CircularSpinner } from "./CircularSpinner";


export type MonacoEditorProps = {
  user: User;
  handle: DocHandle<Document>;
  preview?: Preview | null;
}

export function MonacoEditor({ user, handle, preview }: MonacoEditorProps) {

  const [doc, changeDoc] = useDocument<Document>(handle?.url);
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
  const editEvents = useRef<EventLogType[]>([]);

  const [widgets, dispatchWidgets] = useReducer(widgetsReducer, []);
  const [selections, dispatchSelections] = useReducer(selectionReducer, []);
  const [head, dispatchEditorContent] = useReducer(editorContentReducer, "");

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
      const activePeers: Peer[] = getActivePeers(peerStates, heartbeats);

      activePeers.forEach((peer: Peer) => {
        const { user, position, selection } = peer;

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
      });

      dispatchWidgets({
        type: WidgetActionType.CLEAR_UNACTIVE,
        activePeers: activePeers.map((peer: Peer) => peer.user.id)
      });

      dispatchSelections({
        type: SelectionActionType.CLEAR_UNACTIVE,
        activePeers: activePeers.map((peer: Peer) => peer.user.id)
      });
    } else {
      dispatchWidgets({
        type: WidgetActionType.CLEAR_UNACTIVE,
        activePeers: Object.keys({})
      });

      dispatchSelections({
        type: SelectionActionType.CLEAR_UNACTIVE,
        activePeers: Object.keys({})
      });
    }
  }, [peerStates, heartbeats, user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatchWidgets({
        type: WidgetActionType.CLEAR_UNACTIVE,
        activePeers: Object.keys({})
      });

      dispatchSelections({
        type: SelectionActionType.CLEAR_UNACTIVE,
        activePeers: Object.keys({})
      });
    }, config.defaults.activePeerTimeout);

    return () => clearTimeout(timeoutId);
  }, [heartbeats]);

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

      const put = changeMeta.patches.find((patch: Patch) => patch.action === ContentActionType.PUT);

      changeMeta.patches.forEach((patch: Patch) => {
        if (patch.action === ContentActionType.PUT) return; // PUT events are empty
        if (patch.action === ContentActionType.DEL && !patch.length) // DEL events with no length are actually length 1
          patch.length = 1;

        // @ts-ignore
        let actionType: ContentActionType = ContentActionType[patch.action.toUpperCase()];

        if ((put || !head) && ContentActionType.SPLICE) // use replace on init
          actionType = ContentActionType.REPLACE

        dispatchEditorContent({
          type: actionType,
          editor: editorRef.current,
          user,
          events: editEvents.current,
          head: changeMeta.head,
          index: patch.path[1] as number,
          // @ts-ignore
          value: patch.value,
          // @ts-ignore
          length: patch.length
        });
      });
    }
  }, [doc, head, user]);

  return (
    <div className={`w-full h-full min-h-[calc(100vh-4rem)] ${preview?.head ? "hidden" : "flex"}`}>
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
  );
}