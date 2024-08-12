import { CursorWidget } from "../helpers/monaco/cursor";
import { SelectionDecoration } from "../helpers/monaco/selection";

import { EventLogType } from "./";

export type EditorState = {
  widgets: CursorWidget[]
  selections: SelectionDecoration[]
  eventLog: EventLogType[]
  head: string | null
}