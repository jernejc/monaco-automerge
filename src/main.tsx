import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { Repo } from "@automerge/automerge-repo"
import { RepoContext } from '@automerge/automerge-repo-react-hooks';

import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel';
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket';

import App from './App.tsx';
import './main.css';

const repo: Repo = new Repo({
  network: [
    //new BroadcastChannelNetworkAdapter(),
    new BrowserWebSocketClientAdapter('wss://sync.automerge.org')
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RepoContext.Provider value={repo}>
    <App />
  </RepoContext.Provider>,
)
