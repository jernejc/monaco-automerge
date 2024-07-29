import { Doc } from "@automerge/automerge-repo";

import { Document, ChangeMeta } from "../../types";

export function getChangeMeta(doc: Doc<Document>): ChangeMeta | null {
  const metaSymbol: symbol | undefined = Object.getOwnPropertySymbols(doc).find(
    // @ts-ignore
    (s) => doc[s].mostRecentPatch
  );

  if (metaSymbol === undefined) return null;

  // @ts-ignore
  const metaData: any = doc[metaSymbol];

  return {
    patches: metaData.mostRecentPatch?.patches || [],
    head: metaData.mostRecentPatch?.after[0]
  }
}