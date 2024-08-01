import { Doc, State } from "@automerge/automerge";
import { Document } from "./document";

export type Preview = {
  currentDoc: Doc<Document>
  newState: State<Document>
  head: string
}