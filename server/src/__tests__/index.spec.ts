
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { WebSocket } from "ws"

import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { Repo } from "@automerge/automerge-repo"

import { ready, close } from "../index";


const PORT: number = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3080;

describe("Sync Server Setup and Connect", () => {

  beforeAll(async () => {
    await ready();
  });

  afterAll(() => {
    close();
  });

  test("open websocket connection", (done) => {
    const ws = new WebSocket(`ws://localhost:${PORT}`);

    ws.on("open", () => {
      ws.close();
      done();
    })
  });

  test("can sync a document with the server and get back the same document", async () => {
    const repo: Repo = new Repo({
      // @ts-ignore
      network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)]
    });

    const repo2: Repo = new Repo({
      // @ts-ignore
      network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)]
    });

    const handle = repo.create();

    handle.change((doc: any) => {
      doc.test = "hello world";
    });

    const handle2 = repo2.find(handle.url);
    const doc = await handle2.doc();

    expect(doc?.test).toEqual("hello world");
  });
});