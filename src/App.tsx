import { faker } from '@faker-js/faker';

import { DocHandle, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { useRepo } from '@automerge/automerge-repo-react-hooks';

import { MonacoEditor } from "./components/editor/MonacoEditor";

import { Document, User } from "./types";
import { Header } from './components/header/Header';
import { config } from './config';

export default function App() {
  const repo = useRepo()

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
    handle = repo.create<Document>({ text: '' })
  }

  document.location.hash = handle.url // update the URL

  return (
    <div className='bg-neutral-800 text-white'>
      <Header handle={handle} user={user} />
      <MonacoEditor handle={handle} user={user} />
    </div>
  );
}
