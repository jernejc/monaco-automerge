import { getHistory, State, Doc } from "@automerge/automerge";

import { Document } from "@/types";

export function getHashSnapshot(doc: Doc<Document>, hash: string): string {
  return getHistory(doc).find((state: State<Document>) => state.change.hash === hash)?.snapshot.text || "";
}