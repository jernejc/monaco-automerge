
import { editor, IPosition } from "monaco-editor";

import { CursorWidget } from '../helpers/monaco/widget';
import { User } from '../types';

type Action = {
  type: string;
  user?: User;
  position?: IPosition;
  editor?: editor.ICodeEditor;
  activePeers?: string[];
}

export function widgetsReducer(widgets: CursorWidget[], action: Action): CursorWidget[] {

  widgets = widgets || [];

  switch (action.type) {
    case 'upsert':
      const existingItem = findExisting(widgets, action.user!);

      if (existingItem) {
        existingItem.setPosition(action.position!);
        return widgets;
      }

      return [
        ...widgets,
        new CursorWidget(action.editor!, action.user!, action.position!)
      ];
    case 'remove':
      const removeItem = findExisting(widgets, action.user!);

      if (removeItem) {
        removeItem.dispose();
        return widgets.filter((t) => t.user.id !== action.user!.id);
      }

      return widgets
    case 'clearUnactive':
      widgets.forEach((widget: CursorWidget) => {
        if (!action.activePeers?.includes(widget.user.id)) 
          widget.dispose();
      });

      return widgets.filter((widget: CursorWidget) => !widget.disposed);
    default:
      throw Error('Unknown action: ' + action.type);
  }
}

function findExisting(widgets: CursorWidget[], user: User) {
  return widgets.find((t) => t.user.id === user.id);
}