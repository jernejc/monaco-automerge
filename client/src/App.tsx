import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";

import { Provider } from "react-redux"

import { rootLoader } from "@/loaders/rootLoader";

import { Repo } from "@automerge/automerge-repo";
import { useRepo } from "@automerge/automerge-repo-react-hooks";

import { store } from "@/redux/store";

import { Wrapper } from "@/components/layout/Wrapper";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { PreviewEditor } from "@/components/editor/PreviewEditor";

export default function App() {

  const repo: Repo = useRepo();
  
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
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
