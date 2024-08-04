
import fs from "fs"
import os from "os"

import express from "express"
import { WebSocketServer } from "ws"

import { PeerId, Repo } from "@automerge/automerge-repo"
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"

const socketWS: WebSocketServer = new WebSocketServer({ noServer: true });

const dir = process.env.DATA_DIR !== undefined ? process.env.DATA_DIR : "amrg";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const hostname = os.hostname();
const config = {
  network: [new NodeWSServerAdapter(socketWS)],
  storage: new NodeFSStorageAdapter(dir),
  peerId: `storage-server-${hostname}` as PeerId,
  sharePolicy: async () => console.log("sharePolicy"),
}

// @ts-ignore
const repo: Repo = new Repo(config);

const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3080;
const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`👍 @automerge/automerge-repo-sync-server is running`)
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
  socketWS.handleUpgrade(request, socket, head, (socket) => {
    socketWS.emit("connection", socket, request)
  });
});