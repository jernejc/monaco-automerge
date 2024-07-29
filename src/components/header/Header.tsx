
import { DocHandle } from "@automerge/automerge-repo";
import { useRemoteAwareness } from "@automerge/automerge-repo-react-hooks";

import { User, Document } from "../../types";

import { Logo } from "./Logo";
import { HistoryIcon } from "./HistoryIcon";
import { UsersIcon } from "./UsersIcon";


export function Peers({ peerStates }: { peerStates: any }) {
  return (
    <div className="ml-auto flex flex-row">
      <div className="flex flex-row items-center space-x-2">
        {Object.keys(peerStates).map((peer: string) => {
          const { user } = peerStates[peer];

          if (!user) return null;

          return (
            <div key={user.id} className="flex w-8 h-8 items-center justify-center text-2xl rounded-full overflow-hidden" style={{ background: user.color }}>
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )
        })}
      </div>

      <div className="ml-4">
        <UsersIcon />
      </div>
    </div>
  )
}

export function Header({ handle, user, setViewHistory }: { handle: DocHandle<Document>, user: User, setViewHistory: any }) {
  const [peerStates] = useRemoteAwareness({
    handle,
    localUserId: user.id,
    offlineTimeout: 10000
  });

  return (
    <div className="flex items-center w-full h-16 bg-neutral-950 text-white px-4 gap-6">
      <Logo />

      <Peers peerStates={peerStates} />

      <button onClick={() => setViewHistory((current: boolean) => !current)}>
        <HistoryIcon />
      </button>
    </div>
  )
}