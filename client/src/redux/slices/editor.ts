
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Range } from "monaco-editor";

import { CursorWidget } from "@/helpers/monaco/cursor";
import { SelectionDecoration } from "@/helpers/monaco/selection";

import { RootState, AppThunk } from "@/redux/store";

import { User, Peer, EditPayload, EditPayloadType, WidgetPayload, SelectionPayload, PayloadType, EventLogType, EditorState } from "@/types";


const initialState: EditorState = {
  widgets: [],
  selections: [],
  eventLog: [],
  head: null
}

export const slice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    removeEventLog(state, action: PayloadAction<EventLogType>) {
      const index = state.eventLog.indexOf(action.payload);

      if (index > -1) {
        state.eventLog.splice(index, 1);
      }
    },
    addEventLog(state, action: PayloadAction<EventLogType>) {
      state.eventLog.push(action.payload);
    },
    setWidgets: (state, action: PayloadAction<CursorWidget[]>) => {
      // @ts-ignore
      state.widgets = action.payload;
    },
    setSelections: (state, action: PayloadAction<SelectionDecoration[]>) => {
      // @ts-ignore
      state.selections = action.payload;
    },
    setCurrentHead: (state, action: PayloadAction<string>) => {
      state.head = action.payload;
    },
  },
})

export const { setWidgets, setSelections, setCurrentHead, removeEventLog, addEventLog } = slice.actions;
export const editorReducer = slice.reducer;

export const getWidgets = (state: RootState) => state.editor.widgets
export const getSelections = (state: RootState) => state.editor.selections
export const getHead = (state: RootState) => state.editor.head

export const getEventLogLocal = (state: RootState) => state.editor.eventLog.filter((log: EventLogType) => log === EventLogType.LOCAL)
export const getEventLogRemote = (state: RootState) => state.editor.eventLog.filter((log: EventLogType) => log === EventLogType.REMOTE)

// Content Edit Thunk

export const executeEdit = (payload: EditPayload): AppThunk => {
  return (dispatch) => {
    const { editor, index, user, type, value, length } = payload;

    dispatch(addEventLog(EventLogType.REMOTE));

    switch (type) {
      case EditPayloadType.REPLACE: {
        editor.setValue(value || "");
        return dispatch(setCurrentHead(payload.head))
      } case EditPayloadType.SPLICE: {
        const position = editor.getModel()!.getPositionAt(index);

        editor.executeEdits(user.id, [{
          range: new Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          text: value || "",
          forceMoveMarkers: true
        }]);

        return dispatch(setCurrentHead(payload.head))
      } case EditPayloadType.DEL: {
        const start = editor.getModel()!.getPositionAt(index);
        const end = editor.getModel()!.getPositionAt(index + length!);

        editor.executeEdits(user.id, [{
          range: new Range(
            start.lineNumber,
            start.column,
            end.lineNumber,
            end.column
          ),
          text: "",
          forceMoveMarkers: true
        }]);

        return dispatch(setCurrentHead(payload.head))
      }
      default:
        throw Error("Unknown action: " + type);
    }
  }
}

// Widget Thunk

export const widgetUpdate = (payload: WidgetPayload): AppThunk => {
  return (dispatch, getState) => {
    const { type, user, position, editor, activePeers } = payload;
    const items = getWidgets(getState());

    switch (type) {
      case PayloadType.UPSERT: {
        const existingItem = findExistingWidget(items, user!);

        if (existingItem) {
          existingItem.setPosition(position!);
          return dispatch(setWidgets(items));
        }

        return dispatch(setWidgets([
          ...items,
          new CursorWidget(editor!, user!, position!)
        ]));
      } case PayloadType.REMOVE: {
        const removeItem = findExistingWidget(items, user!);

        if (removeItem) {
          removeItem.dispose();
          return dispatch(setWidgets(items.filter((widget: CursorWidget) => !widget.disposed)));
        }

        return dispatch(setWidgets(items));
      } case PayloadType.CLEAR_UNACTIVE: {
        items.forEach((widget: CursorWidget) => {
          if (activePeers?.length === 0 || !activePeers?.find((peer: Peer) => peer.user.id === widget.user.id))
            widget.dispose();
        });

        return dispatch(setWidgets(items.filter((widget: CursorWidget) => !widget.disposed)));
      }
      default:
        throw Error("Unknown action: " + type);
    }
  }
}

function findExistingWidget(items: CursorWidget[], user: User): CursorWidget | undefined {
  return items.find((t) => t.user.id === user.id);
}

// Selection Thunk

export const selectionUpdate = (payload: SelectionPayload): AppThunk => {
  return (dispatch, getState) => {
    const { type, user, selection, editor, activePeers } = payload;
    const items = getSelections(getState());

    switch (type) {
      case PayloadType.UPSERT: {
        const existingItem = findExistingSelection(items, user!);

        if (existingItem) {
          const { start, end } = SelectionDecoration.getStartEndFromSelection(selection!);
          existingItem.setPositions(start, end);
          return dispatch(setSelections(items));
        }

        return dispatch(setSelections([
          ...items,
          new SelectionDecoration(editor!, user!, selection!)
        ]));
      } case PayloadType.REMOVE: {
        const removeItem = findExistingSelection(items, user!);

        if (removeItem) {
          removeItem.dispose();
          return dispatch(setSelections(items.filter((selection: SelectionDecoration) => !selection.disposed)));
        }

        return dispatch(setSelections(items))
      } case PayloadType.CLEAR_UNACTIVE: {
        items.forEach((selection: SelectionDecoration) => {
          if (activePeers?.length === 0 || !activePeers?.find((peer: Peer) => peer.user.id === selection.user.id))
            selection.dispose();
        });

        return dispatch(setSelections(items.filter((selection: SelectionDecoration) => !selection.disposed)));
      }
      default:
        throw Error("Unknown action: " + type);
    }
  }
}

function findExistingSelection(items: SelectionDecoration[], user: User): SelectionDecoration | undefined {
  return items.find((t) => t.user.id === user.id);
}