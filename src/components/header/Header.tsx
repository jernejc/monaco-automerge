
import { DocHandle } from "@automerge/automerge-repo";
import { useRemoteAwareness } from "@automerge/automerge-repo-react-hooks";

import { User, Document } from "../../types";

import { Logo } from "./Logo";

export function Peers({ peerStates }: { peerStates: any }) {
  return (
    <div className="ml-auto flex flex-row items-center space-x-2">
      {Object.keys(peerStates).map((peer: string) => {
        const { user } = peerStates[peer];
        
        if (!user) return null;

        return (
          <div key={user.id} className="flex w-10 h-10 items-center justify-center text-2xl rounded-full overflow-hidden" style={{ background: user.color }}>
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        )
      })}
    </div>
  )
}

export function Header({ handle, user }: { handle: DocHandle<Document>, user: User }) {
  const [peerStates] = useRemoteAwareness({
    handle,
    localUserId: user.id,
    offlineTimeout: 10000
  });

  return (
    <div className="flex w-full h-16 bg-neutral-950 text-white px-4">
      <Logo />

      {peerStates && <Peers peerStates={peerStates} />}
    </div>
  )
}