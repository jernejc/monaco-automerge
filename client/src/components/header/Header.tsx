import { useEffect, useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

import { DocHandle } from "@automerge/automerge-repo";
import { useRemoteAwareness } from "@automerge/automerge-repo-react-hooks";

import { useAppSelector } from "@/redux/hooks";
import { getUser } from "@/redux/slices/user";

import { User, Document } from "@/types";

import { getActivePeers } from "@/helpers/automerge/getActivePeers";

import { Logo } from "@/components/header/Logo";
import { HistoryIcon } from "@/components/header/HistoryIcon";
import { UsersIcon } from "@/components/header/UsersIcon";

import { config } from "@/config";


export type HeaderProps = {
  setViewHistory: any;
}

export function Header({ setViewHistory }: HeaderProps) {

  const { handle } = useRouteLoaderData("root") as { handle: DocHandle<Document> };

  const user = useAppSelector(getUser);
  const [userList, setUserList] = useState<User[]>([]);

  const [peerStates, heartbeats] = useRemoteAwareness({
    handle,
    localUserId: user.id,
    offlineTimeout: config.defaults.activePeerTimeout
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setUserList([])
    }, config.defaults.activePeerTimeout);

    return () => clearTimeout(timeoutId);
  }, [heartbeats]);

  useEffect(() => {
    if (!peerStates) return setUserList([]);

    const activePeers = getActivePeers(peerStates, heartbeats);

    if (activePeers.length === 0) return setUserList([]);

    setUserList(() => activePeers.map((peer) => peer.user));
  }, [peerStates, heartbeats]);

  return (
    <div className="flex items-center w-full h-16 bg-neutral-950 text-white px-4 gap-6">
      <Logo />

      <Peers userList={userList} />

      <button onClick={() => setViewHistory((current: boolean) => !current)}>
        <HistoryIcon />
      </button>
    </div>
  )
}

export function Peers({ userList }: { userList: User[] }) {

  return (
    <div className="ml-auto flex flex-row">
      <div className="flex flex-row items-center space-x-2">
        {userList && userList.map((user: User) => {
          if (!user) return null;

          return (
            <div className="flex w-8 h-8 items-center justify-center text-2xl rounded-full overflow-hidden"
              key={`${user.id}`}
              role="figure"
              style={{ background: user.color }}>
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