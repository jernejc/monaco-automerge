
import { useState } from "react";
import { DocHandle } from "@automerge/automerge-repo";

import { Document, User, Preview } from "../../types";

import { MonacoEditor } from "../editor/MonacoEditor";
import { Header } from "../header/Header";
import { HistorySidebar } from "../history/Sidebar";
import { PreviewEditor } from "../editor/PreviewEditor";

export function Wrapper({ user, handle }: { user: User, handle: DocHandle<Document> }) {

  const [preview, setPreview] = useState<Preview | null>(null);

  return (
    <div className="flex flex-row w-full">
      <div className="flex flex-col w-full">
        <div>
          <Header user={user} handle={handle} />
        </div>

        {preview === null &&
          <div>
            <MonacoEditor user={user} handle={handle} />
          </div>
        }
        {preview !== null &&
          <div>
            <PreviewEditor preview={preview} setPreview={setPreview} />
          </div>
        }
      </div>

      <HistorySidebar handle={handle} setPreview={setPreview} />
    </div>
  )
}