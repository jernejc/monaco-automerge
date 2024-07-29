import { useCallback } from "react";

import { DiffEditor } from "@monaco-editor/react";

import { DocHandle } from "@automerge/automerge-repo";
import { updateText } from "@automerge/automerge/next";
import { useDocument } from "@automerge/automerge-repo-react-hooks";

import { Preview, Document } from "../../types";

import { CircularSpinner } from "./CircularSpinner";

export function PreviewEditor({ handle, preview, setPreview }: { handle: DocHandle<Document>, preview: Preview, setPreview: any }) {

  const [doc, changeDoc] = useDocument<Document>(handle?.url);

  const revert = useCallback(() => {
    if (doc) {
      changeDoc(currentDoc => updateText(currentDoc, ["text"], preview.newState.snapshot.text));
      setPreview(null);
    }
  }, [doc, preview]);

  return (
    <div className="min-h-[calc(100vh-4rem)] h-full w-full overflow-hidden">
      <div className="flex flex-row px-4 items-center h-16">
        <span className="text-lg font-bold"># {preview.head}</span>

        <div className="flex flex-row ml-auto w-auto gap-2">
          <button className="flex items-center justify-center bg-neutral-400 p-2 px-4 text-black shadow-md" onClick={revert}>
            Apply
          </button>
          <button className="flex items-center justify-center bg-neutral-950 p-2 px-4 shadow-md" onClick={() => setPreview(null)}>
            Cancel
          </button>
        </div>
      </div>

      <DiffEditor
        className="min-h-[calc(100vh-8rem)] h-full w-full grow"
        language="typescript"
        theme="vs-dark"
        loading={<CircularSpinner />}
        original={doc?.text}
        modified={preview.newState.snapshot.text} />
    </div>
  )
}