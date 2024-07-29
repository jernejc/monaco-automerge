import { State } from "@automerge/automerge";
import { Document } from "./document";

export type Preview = {
  currentText: string
  newState: State<Document>
  head: string
}