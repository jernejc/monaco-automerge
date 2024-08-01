# Wolf Editor - Collaborative code editing

<p align="center" style="margin: 30px 0px">
  <a href="https://www.qawolf.com/">
    <img alt="QA Wolf Logo" src="https://cdn.prod.website-files.com/6260298eca091b57c9cf188e/6260298eca091b8710cf18ea_logo.svg" width="160" />
  </a>
</p>

A collaborative code editor built using [Monaco Editor](https://microsoft.github.io/monaco-editor/), [Automerge](https://automerge.org/). Supports real-time collaborative editing with cursor and selection sharing. Changes are synced peer to peer and via websockets to a central server (sync.automerge.org).

<p align="center">
  <img alt="Ed" src="./assets/qa-wolf-demo_4.gif" />
</p>


## Run locally

To get started with this project, follow the steps below:

1. Clone the repository:
    ```sh
    git clone https://github.com/jernejc/qawolf-collab-editor
    cd qawolf-collab-editor
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm run dev
    ```


### Relevant projects

- https://github.com/automerge/automerge-repo 
- https://github.com/automerge/automerge-repo/tree/main/packages/automerge-repo-react-hooks
- https://github.com/automerge/automerge-prosemirror
- https://github.com/automerge/automerge-repo-sync-server
- https://github.com/microsoft/monaco-editor
- https://github.com/convergencelabs/monaco-collab-ext/