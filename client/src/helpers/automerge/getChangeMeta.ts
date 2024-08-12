import { Doc } from "@automerge/automerge-repo";

import { Document, ChangeMeta, ChangePatch, EditPayloadType } from "../../types";


export function getChangeMeta(doc: Doc<Document>): ChangeMeta | null {
  const metaSymbol: symbol | undefined = Object.getOwnPropertySymbols(doc).find(
    // @ts-ignore
    (s) => doc[s].mostRecentPatch
  );

  if (metaSymbol === undefined) return null;

  // @ts-ignore
  const metaData: any = doc[metaSymbol];

  const patches: ChangePatch[] = metaData.mostRecentPatch?.patches.filter((patch: ChangePatch) => {
    return patch.action !== EditPayloadType.PUT
  }).map((patch: ChangePatch) => {
    if (patch.action === EditPayloadType.DEL && !patch.length) // DEL events with no length are actually length 1
        patch.length = 1;

    patch.length = patch.length || patch.value.length || 0

    // @ts-ignore
    patch.actionType = EditPayloadType[patch.action.toUpperCase()];
    return patch;
  }) || [];

  return {
    patches,
    head: metaData.mostRecentPatch?.after[0]
  }
}