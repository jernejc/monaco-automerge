import { Logo } from './Logo';

import { DocHandle } from "@automerge/automerge-repo";
import { useRemoteAwareness } from '@automerge/automerge-repo-react-hooks';

import { State, User } from "../../types";

export function Header({ handle, user }: { handle: DocHandle<State>, user: User }) {
  const [peerStates] = useRemoteAwareness({
    handle,
    localUserId: user.id,
  });

  return (
    <div className='flex w-full h-16 bg-neutral-950 text-white px-4'>
      <Logo />

      {peerStates &&
        <div className='ml-auto flex flex-row items-center space-x-2'>
          {Object.keys(peerStates).map((peer: string) => {
            const { user } = peerStates[peer];

            if (!user) return null;

            return (
              <div key={user.id} className='w-10 h-10 rounded-full border-4 overflow-hidden' style={{ borderColor: user.color }}>
                <img src={user.avatar} alt={user.name} />
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}