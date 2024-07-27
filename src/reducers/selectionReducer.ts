
import { editor, Selection } from "monaco-editor";

import { SelectionDecoration } from "../helpers/monaco/selection";
import { User } from "../types";

export enum SelectionActionType {
  UPSERT = "upsert",
  REMOVE = "remove",
  CLEAR_UNACTIVE = "clearUnactive"
}

export type SelectionAction = {
  type: SelectionActionType;
  user?: User;
  selection?: Selection;
  editor?: editor.ICodeEditor;
  activePeers?: string[];
}

export function selectionReducer(selections: SelectionDecoration[], action: SelectionAction) {
  
  switch (action.type) {
    case SelectionActionType.UPSERT:
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
    case SelectionActionType.REMOVE:
      const removeItem = findExisting(selections, action.user!);

      if (removeItem) {
        removeItem.dispose();
        return selections.filter((selection: SelectionDecoration) => !selection.disposed);
      }

      return selections
    case SelectionActionType.CLEAR_UNACTIVE:
      selections.forEach((selection: SelectionDecoration) => {
        if (!action.activePeers || !action.activePeers?.includes(selection.user.id))
          selection.dispose();
      });

      return selections.filter((selection: SelectionDecoration) => !selection.disposed);
    default:
      throw Error("Unknown action: " + action.type);
  }
}

function findExisting(selections: SelectionDecoration[], user: User) {
  return selections.find((t) => t.user.id === user.id);
}