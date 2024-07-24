
import { editor, Range } from "monaco-editor";

import { User } from '../types';

export enum ContentActionType {
  SPLICE = 'splice',
  DEL = 'del',
  REPLACE = 'replace',
  PUT = 'put'
}

export type ContentAction = {
  type: ContentActionType;
  editor: editor.ICodeEditor;
  user: User;
  index: number;
  value: string;
  length?: number;
}

export function editorContentReducer(text: string, action: ContentAction) {
  const { editor, index, user, type, value } = action;
  console.log('editorContentReducer action', action);

  if (!editor || !editor.getModel()) return text;

  switch (type) {
    case ContentActionType.REPLACE:
      const start = editor.getModel()!.getPositionAt(index);
      const end = editor.getModel()!.getPositionAt(index + value.length);

      editor.executeEdits(user.id, [{
        range: new Range(
          start.lineNumber,
          start.column,
          end.lineNumber,
          end.column
        ),
        text: action.value,
        forceMoveMarkers: true
      }]);

      return text
    case ContentActionType.SPLICE:
      const position = editor.getModel()!.getPositionAt(index);

      editor.executeEdits(user.id, [{
        range: new Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        text: action.value,
        forceMoveMarkers: true
      }]);

      return text
    case ContentActionType.DEL:
      const startDel = editor.getModel()!.getPositionAt(index);
      const endDel = editor.getModel()!.getPositionAt(index + action.length!);

      editor.executeEdits(user.id, [{
        range: new Range(
          startDel.lineNumber,
          startDel.column,
          endDel.lineNumber,
          endDel.column
        ),
        text: "",
        forceMoveMarkers: true
      }]);

      return text
    case ContentActionType.PUT:
      return text
    default:
      throw Error('Unknown action: ' + type);
  }
}