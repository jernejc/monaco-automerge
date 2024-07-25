
import { editor, Range } from "monaco-editor";

import { User } from "../types";

export enum ContentActionType {
  SPLICE = "splice",
  DEL = "del",
  REPLACE = "replace",
  PUT = "put"
}

export type ContentAction = {
  type: ContentActionType;
  editor: editor.ICodeEditor;
  user: User | null;
  events: string[];
  head: string;
  index: number;
  value: string;
  length?: number;
}

// Editor executeEdits should be done outside of the reducer
export function editorContentReducer(head: string, action: ContentAction) {
  const { editor, index, user, type, value, events, length } = action;

  if (!editor || !editor.getModel()) return action.head;

  events.push("remote")

  switch (type) {
    case ContentActionType.REPLACE: {
      const start = editor.getModel()!.getPositionAt(index);
      const end = editor.getModel()!.getPositionAt(index + value.length);

      editor.executeEdits(user!.id, [{
        range: new Range(
          start.lineNumber,
          start.column,
          end.lineNumber,
          end.column
        ),
        text: value,
        forceMoveMarkers: true
      }]);

      return action.head
    } case ContentActionType.SPLICE: {
      const position = editor.getModel()!.getPositionAt(index);

      editor.executeEdits(user!.id, [{
        range: new Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        text: value || "",
        forceMoveMarkers: true
      }]);

      return action.head
    } case ContentActionType.DEL: {
      const start = editor.getModel()!.getPositionAt(index);
      const end = editor.getModel()!.getPositionAt(index + length!);

      editor.executeEdits(user!.id, [{
        range: new Range(
          start.lineNumber,
          start.column,
          end.lineNumber,
          end.column
        ),
        text: "",
        forceMoveMarkers: true
      }]);

      return action.head
    }
    default:
      throw Error("Unknown action: " + type);
  }
}