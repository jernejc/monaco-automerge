
import { describe, test, beforeEach, afterEach, expect } from '@jest/globals';
import { WebSocket } from "ws"

import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import { Repo } from "@automerge/automerge-repo"

import { ready, close } from '../index';

const PORT: number = 3080;

describe("Sync Server Setup and Connect", () => {
  beforeEach(async () => {
    await ready();
  });

  afterEach(() => {
    close();
  });

  test("open websocket connection", (done) => {
    const ws = new WebSocket(`ws://localhost:${PORT}`);

    ws.on("open", () => {
      done();
    })
  });

  test("can sync a document with the server and get back the same document", (done) => {
    const repo = new Repo({
      // @ts-ignore
      network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
    })

    const repo2 = new Repo({
      // @ts-ignore
      network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
    })

    const handle = repo.create()

    handle.change((doc: any) => {
      doc.test = "hello world"
    })

    const handle2 = repo2.find(handle.url)

    handle2.doc().then((doc) => {
      expect(doc.test).toEqual("hello world")
      done();
    });
  });
});