import { useEffect, useState } from "react";

import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { State } from "@automerge/automerge";
import { DocHandle } from "@automerge/automerge-repo";

import { Document, Preview } from "../../types";

import { getHistoryLogs } from "../../helpers/automerge/getHistoryLogs";

export function HistorySidebar({ handle, preview, setPreview }: { handle: DocHandle<Document>, setPreview: any, preview?: Preview | null }) {

  const [doc] = useDocument<Document>(handle?.url);
  const [history, setHistory] = useState<State<Document>[]>([]);

  useEffect(() => {
    if (!doc) return;

    setHistory(() => getHistoryLogs(doc));
  }, [doc]);

  const openPreview = (state: State<Document>) => {
    if (doc?.text) {
      setPreview({
        newState: state,
        head: state.change.hash,
        currentText: doc?.text,
      });
    }
  }

  return (
    <div className="flex flex-col max-w-80 min-w-80 h-[100vh] bg-neutral-950">
      <div className="flex flex-row items-center justify-between p-4 pr-2 h-16">
        <span className="text-lg font-semibold text-neutral-400">History</span>
        <button className="flex items-center justify-center w-8 h-8 bg-neutral-800 hover:bg-neutral-700 ml-auto">
          <CloseIcon />
        </button>
      </div>
      <div className="flex flex-col max-w-full max-h-[calc(100vh - 4rem)] overflow-y-auto">
        {history.map((state: State<Document>, index: number) =>
          <div className={`flex flex-col group hover:bg-neutral-700 px-3 py-2 cursor-pointer ${preview?.head === state.change.hash ? 'bg-neutral-700' : ''}`}
               onClick={() => openPreview(state)}
               key={index}>
            <div className="flex flex-row items-center gap-2">
              <span className="text-sm font-semibold">#</span>
              <span className="text-sm truncate w-auto">{state.change.hash}</span>
              <span className="w-4 h-4 rounded-full bg-green-700" ></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function CloseIcon() {
  return (
    <span className="text-neutral-400">
      <svg fill="currentColor" height="18px" width="18px"
        viewBox="0 0 1792 1792">
        <path d="M1082.2,896.6l410.2-410c51.5-51.5,51.5-134.6,0-186.1s-134.6-51.5-186.1,0l-410.2,410L486,300.4
	c-51.5-51.5-134.6-51.5-186.1,0s-51.5,134.6,0,186.1l410.2,410l-410.2,410c-51.5,51.5-51.5,134.6,0,186.1
	c51.6,51.5,135,51.5,186.1,0l410.2-410l410.2,410c51.5,51.5,134.6,51.5,186.1,0c51.1-51.5,51.1-134.6-0.5-186.2L1082.2,896.6z"/>
      </svg>
    </span>
  )
}