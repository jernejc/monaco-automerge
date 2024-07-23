import { faker } from '@faker-js/faker';

import { AutomergeUrl, DocHandle, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { useRepo } from '@automerge/automerge-repo-react-hooks';

import { MonacoEditor } from "./components/editor/MonacoEditor";

import { State, User } from "./types";
import { Header } from './components/header/Header';

export default function App() {
  const repo = useRepo()

  const rootDocUrl: string = `${document.location.hash.substring(1)}`

  const user: User = {
    id: faker.string.uuid(),
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    color: faker.color.rgb()
  }

  let handle: DocHandle<State>

  if (isValidAutomergeUrl(rootDocUrl)) {
    handle = repo.find(rootDocUrl)
  } else {
    handle = repo.create<State>({ text: '' })
  }

  const docUrl: AutomergeUrl = (document.location.hash = handle.url)

  return (
    <div className='bg-neutral-800 text-white'>
      <Header handle={handle} user={user} />
      <MonacoEditor url={docUrl} handle={handle} user={user} />
    </div>
  );
}
