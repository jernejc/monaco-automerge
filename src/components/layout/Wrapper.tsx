
import { useState } from "react";
import { DocHandle } from "@automerge/automerge-repo";

import { Document, User, Preview } from "../../types";

import { MonacoEditor } from "../editor/MonacoEditor";
import { Header } from "../header/Header";
import { HistorySidebar } from "../history/Sidebar";
import { PreviewEditor } from "../editor/PreviewEditor";

export function Wrapper({ user, handle }: { user: User, handle: DocHandle<Document> }) {

  const [preview, setPreview] = useState<Preview | null>(null);
  const [viewHistory, setViewHistory] = useState<boolean>(false);

  return (
    <div className="flex flex-row h-full w-full max-w-full">
      <div className={`flex flex-col w-full ${viewHistory ? 'max-w-[calc(100vw-20rem)]' : ''}`}>
        <div>
          <Header user={user} handle={handle} setViewHistory={setViewHistory} />
        </div>

        {preview !== null &&
          <PreviewEditor handle={handle} preview={preview} setPreview={setPreview} />
        }

        <MonacoEditor user={user} handle={handle} preview={preview} />
      </div>

      {viewHistory &&
        <HistorySidebar handle={handle} preview={preview} setPreview={setPreview} setViewHistory={setViewHistory} />
      }
    </div>
  )
}