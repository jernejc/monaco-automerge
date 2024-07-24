
import { editor, IPosition } from "monaco-editor";

import { CursorWidget } from '../helpers/monaco/widget';
import { User } from '../types';

export enum WidgetActionType {
  UPSERT = 'upsert',
  REMOVE = 'remove',
  CLEAR_UNACTIVE = 'clearUnactive'
}

export type WidgetAction = {
  type: string;
  user?: User;
  position?: IPosition;
  editor?: editor.ICodeEditor;
  activePeers?: string[];
}

export function widgetsReducer(widgets: CursorWidget[], action: WidgetAction): CursorWidget[] {

  widgets = widgets || [];

  switch (action.type) {
    case WidgetActionType.UPSERT:
      const existingItem = findExisting(widgets, action.user!);

      if (existingItem) {
        existingItem.setPosition(action.position!);
        return widgets;
      }

      return [
        ...widgets,
        new CursorWidget(action.editor!, action.user!, action.position!)
      ];
    case WidgetActionType.REMOVE:
      const removeItem = findExisting(widgets, action.user!);

      if (removeItem) {
        removeItem.dispose();
        return widgets.filter((widget: CursorWidget) => !widget.disposed);
      }

      return widgets
    case WidgetActionType.CLEAR_UNACTIVE:
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