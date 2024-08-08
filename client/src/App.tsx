import { DocHandle, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { useRepo } from "@automerge/automerge-repo-react-hooks";

import { Document, User } from "./types";

import { Wrapper } from "./components/layout/Wrapper";
import { getUser } from "./helpers/getUser";


export default function App() {

  const repo = useRepo();
  const user: User = getUser();

  const rootDocUrl: string = `${document.location.hash.substring(1)}`
  let handle: DocHandle<Document>

  if (isValidAutomergeUrl(rootDocUrl)) 
    handle = repo.find(rootDocUrl)
  else
    handle = repo.create<Document>({ text: "" })

  document.location.hash = handle.url // this will update the URL

  return (
    <div className="flex w-full h-full">
      <Wrapper user={user} handle={handle} />
    </div>
  );
}
