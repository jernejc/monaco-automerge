
import { editor, Selection } from "monaco-editor";

import { SelectionDecoration } from '../helpers/monaco/selection';
import { User } from '../types';

type Action = {
  type: string;
  user?: User;
  selection?: Selection;
  editor?: editor.ICodeEditor;
  activePeers?: string[];
}

export function selectionReducer(selections: SelectionDecoration[], action: Action) {

  selections = selections || [];

  switch (action.type) {
    case 'upsert':
      const existingItem = findExisting(selections, action.user!);

      if (existingItem) {
        const { start, end } = SelectionDecoration.getStartEndFromSelection(action.selection!);
        existingItem.setPositions(start, end);
        return selections;
      }

      return [
        ...selections,
        new SelectionDecoration(action.editor!, action.user!, action.selection!)
      ];
    case 'remove':
      const removeItem = findExisting(selections, action.user!);

      if (removeItem) {
        removeItem.dispose();
        return selections.filter((t) => t.user.id !== action.user!.id);
      }

      return selections
    case 'clearUnactive':
      selections.forEach((selection: SelectionDecoration) => {
        if (!action.activePeers?.includes(selection.user.id))
          selection.dispose();
      });

      return selections.filter((selection: SelectionDecoration) => !selection.disposed);
    default:
      throw Error('Unknown action: ' + action.type);
  }
}

function findExisting(selections: SelectionDecoration[], user: User) {
  return selections.find((t) => t.user.id === user.id);
}