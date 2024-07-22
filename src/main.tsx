import React from 'react'
import ReactDOM from 'react-dom/client'

import { v4 } from 'uuid'

import { DocHandle, Repo, isValidAutomergeUrl, AutomergeUrl } from "@automerge/automerge-repo"
import { RepoContext } from '@automerge/automerge-repo-react-hooks';

import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel';
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket';

import { State } from './types'

import App from './App.tsx'
import './main.css'

const repo: Repo = new Repo({
  network: [
    new BroadcastChannelNetworkAdapter(),
    new BrowserWebSocketClientAdapter('wss://sync.automerge.org')
  ],
});

const rootDocUrl: string = `${document.location.hash.substring(1)}`
const userId: string = v4()

let handle: DocHandle<State>

if (isValidAutomergeUrl(rootDocUrl)) {
  handle = repo.find(rootDocUrl)
} else {
  handle = repo.create<State>({ text: '' })
}

const docUrl: AutomergeUrl = (document.location.hash = handle.url)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RepoContext.Provider value={repo}>
    <React.StrictMode>
      <App url={docUrl} handle={handle} userId={userId} />
    </React.StrictMode>
  </RepoContext.Provider>,
)
