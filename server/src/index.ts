
import fs from "fs";
import os from "os";

import express from "express";
import { WebSocketServer } from "ws";

import { Server } from "http";

import { PeerId, Repo } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";


let isReady: boolean = false;

const readyResolvers: ((value: any) => void)[] = [];
const dir = process.env.DATA_DIR !== undefined ? process.env.DATA_DIR : "amrg";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const socketWS: WebSocketServer = new WebSocketServer({ noServer: true });

const hostname = os.hostname();
const config = {
  network: [new NodeWSServerAdapter(socketWS)],
  storage: new NodeFSStorageAdapter(dir),
  peerId: `storage-server-${hostname}` as PeerId,
  sharePolicy: async () => true
}

// @ts-ignore
const repo: Repo = new Repo(config);

const PORT: number = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3080;
const app = express();

app.get("/", (req, res) => {
  res.send(`👍 automerge-sync-server is running`);
});

const server: Server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  isReady = true;
  readyResolvers.forEach((resolve) => resolve(true));
});

server.on("upgrade", (request, socket, head) => {
  socketWS.handleUpgrade(request, socket, head, (socket) => {
    socketWS.emit("connection", socket, request);
  });
});

export async function ready() {
  if (isReady)
    return true;

  return new Promise((resolve) => {
    readyResolvers.push(resolve);
  });
}

export function close() {
  socketWS.close();
  server.close();
}