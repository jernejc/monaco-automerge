import { getHistory, State, Doc } from "@automerge/automerge";

import { Document } from "@/types";

export function getHistoryLogs(doc: Doc<Document>): State<Document>[] {
  const history: State<Document>[] = getHistory(doc);

  return history.splice(1).reverse();
}