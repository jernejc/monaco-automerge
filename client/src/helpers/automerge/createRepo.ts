import { Repo } from "@automerge/automerge-repo";

import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";

import { config } from "@/config";


export function createRepo(): Repo {
  return new Repo({
    network: [
      // @ts-ignore
      new BroadcastChannelNetworkAdapter(),
      // @ts-ignore
      new BrowserWebSocketClientAdapter(config.defaults.wsConnection),
    ],
  });
}