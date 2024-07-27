import { State } from "@automerge/automerge";
import { Document } from "./document";

export type Preview = {
  currentState: State<Document>
  newState: State<Document>
  head: string
}