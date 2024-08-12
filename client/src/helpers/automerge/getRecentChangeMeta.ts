import { Patch } from "@automerge/automerge";
import { Doc } from "@automerge/automerge-repo";

import { Document, ChangeMeta, ChangePatch, EditPayloadType } from "../../types";


export function getRecentChangeMeta(doc: Doc<Document>): ChangeMeta | null {
  const metaSymbol: symbol | undefined = Object.getOwnPropertySymbols(doc).find(
    // @ts-ignore
    (s) => doc[s].mostRecentPatch
  );

  if (metaSymbol === undefined) return null;

  // @ts-ignore
  const metaData: any = doc[metaSymbol];

  const patches: ChangePatch[] = metaData.mostRecentPatch?.patches.filter((patch: Patch) => {
    return patch.action !== EditPayloadType.PUT
  }).map((patch: Patch): ChangePatch => {
    if (patch.action === EditPayloadType.DEL && !patch.length) // DEL events with no length are actually length 1
        patch.length = 1;
    
    return {
      type: patch.action as EditPayloadType,
      // @ts-ignore
      value: patch.value,
      // @ts-ignore
      length: patch.length || patch.value.length || 0,
      index: patch.path[1] as number || 0
    };
  }) || [];

  return {
    patches,
    head: metaData.mostRecentPatch?.after[0]
  }
}