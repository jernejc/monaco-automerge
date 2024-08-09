import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";

import { Repo } from "@automerge/automerge-repo";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";

import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";

import { rootLoader } from "./helpers/loaders/rootLoader";

import { Wrapper } from "./components/layout/Wrapper";
import { MonacoEditor } from "./components/editor/MonacoEditor";
import { PreviewEditor } from "./components/editor/PreviewEditor";

import { config } from "./config";


export default function App() {

  const repo: Repo = new Repo({
    network: [
      new BroadcastChannelNetworkAdapter(),
      new BrowserWebSocketClientAdapter(config.defaults.wsConnection),
    ],
  });

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Wrapper />} loader={rootLoader(repo)} id="root">
        <Route path=":docUrl" element={<MonacoEditor />} >
          <Route path=":changeId" element={<PreviewEditor />} />
        </Route>
      </Route>
    )
  );

  return (
    <RepoContext.Provider value={repo}>
      <RouterProvider router={router} />
    </RepoContext.Provider>
  );
}
