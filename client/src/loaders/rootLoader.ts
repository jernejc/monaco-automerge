
import { redirect } from "react-router-dom";

import { DocHandle, Repo } from "@automerge/automerge-repo";

import { Document } from "../types";

import { getDocHandle } from '../helpers/automerge/getDocHandle';


export const rootLoader = (repo: Repo) => ({ params }: { params: any }) => {

  const handle: DocHandle<Document> = getDocHandle({ repo, docUrl: params.docUrl });

  if (!params.docUrl) 
    return redirect(`/${handle.url}`);

  return {
    handle
  }
}