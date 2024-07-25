
import { faker } from "@faker-js/faker";

import { DocHandle, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { useRepo } from "@automerge/automerge-repo-react-hooks";

import { Document, User } from "./types";
import { config } from "./config";

import { MonacoEditor } from "./components/editor/MonacoEditor";
import { Header } from "./components/header/Header";

export default function App() {

  const repo = useRepo();
  const rootDocUrl: string = `${document.location.hash.substring(1)}`
  const user: User = {
    id: faker.string.uuid(),
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    color: faker.helpers.arrayElement(config.defaults.cursorColors)
  }

  let handle: DocHandle<Document>

  if (isValidAutomergeUrl(rootDocUrl)) {
    handle = repo.find(rootDocUrl)
  } else {
    handle = repo.create<Document>({ text: "" })
  }

  document.location.hash = handle.url // this will update the URL

  return (
    <div className="bg-neutral-800 text-white">
      <Header user={user} handle={handle} />
      <MonacoEditor user={user} handle={handle} />
    </div>
  );
}
