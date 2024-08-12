import { editor, Position, Selection } from "monaco-editor";
import { User, Peer } from "./";

export enum PayloadType {
  UPSERT = "upsert",
  REMOVE = "remove",
  CLEAR_UNACTIVE = "clearUnactive"
}

export enum EditPayloadType {
  SPLICE = "splice",
  DEL = "del",
  REPLACE = "replace",
  PUT = "put"
}

export type EditPayload = {
  type: EditPayloadType;
  editor: editor.ICodeEditor;
  user: User;
  head: string;
  index: number;
  value: string;
  length?: number;
}

export type WidgetPayload = {
  type: PayloadType;
  user?: User;
  position?: Position;
  editor?: editor.ICodeEditor;
  activePeers?: Peer[];
}

export type SelectionPayload = {
  type: PayloadType;
  user?: User;
  selection?: Selection;
  editor?: editor.ICodeEditor;
  activePeers?: Peer[];
}