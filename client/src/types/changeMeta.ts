import { Patch } from "@automerge/automerge-repo";

export type ChangeMeta = {
  patches: Patch[]
  head: string
}