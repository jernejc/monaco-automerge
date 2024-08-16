import { StrictMode } from "react";

// @ts-ignore
import ReactDOM from "react-dom/client";

import { Repo } from "@automerge/automerge-repo";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";

import { createRepo } from "@/helpers/automerge/createRepo";

import App from "@/App";
import "src/main.css";


const repo: Repo = createRepo();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RepoContext.Provider value={repo}>
      <App />
    </RepoContext.Provider>
  </StrictMode>
)