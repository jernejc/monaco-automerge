
import { AnyDocumentId, DocHandle, Repo, isValidAutomergeUrl } from "@automerge/automerge-repo";

import { Document } from "@/types";

export function getDocHandle({ repo, docUrl }: { repo: Repo, docUrl: string }): DocHandle<Document> {
  let handle: DocHandle<Document>;

  if (isValidAutomergeUrl(docUrl))
    handle = repo.find(docUrl as AnyDocumentId);
  else 
    handle = repo.create<Document>({ text: "" });

  return handle;
}