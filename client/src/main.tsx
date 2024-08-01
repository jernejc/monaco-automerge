import ReactDOM from "react-dom/client";

import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";

import { Repo } from "@automerge/automerge-repo";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";

import App from "./App.tsx";
import "./main.css";

import { config } from "./config.ts";


const repo: Repo = new Repo({
  network: [
    new BroadcastChannelNetworkAdapter(),
    new BrowserWebSocketClientAdapter(config.defaults.wsConnection),
  ],
});


ReactDOM.createRoot(document.getElementById("root")!).render(
  <RepoContext.Provider value={repo}>
    <App />
  </RepoContext.Provider>
)