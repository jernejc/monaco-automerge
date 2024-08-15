import { config } from "@/config";
import { Peer } from "@/types";

export function getActivePeers(peerStates: any, heartbeats: any): Peer[] {
  const activePeers: Peer[] = [];

  for (const peer in peerStates) {
    const { position, selection, user } = peerStates[peer];

    if (!position && !selection)
      continue
    if (activePeers.find((activePeer) => activePeer.user.id === user.id))
      continue

    const lastSeen: number = heartbeats[peer];
    const currentTime: number = Date.now();

    if (currentTime - config.defaults.activePeerTimeout < lastSeen) {
      activePeers.push({
        user,
        position,
        selection
      });
    }
  }

  return activePeers;
}