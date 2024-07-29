import { DiffEditor } from "@monaco-editor/react";

import { Preview } from "../../types";

import { CircularSpinner } from "./CircularSpinner";

export function PreviewEditor({ preview, setPreview }: { preview: Preview, setPreview: any }) {

  return (
    <div className="min-h-[calc(100vh-4rem)] h-full overflow-hidden">
      <div className="flex flex-row px-4 items-center h-16">
        <span className="text-lg font-bold"># {preview.head}</span>

        <div className="flex flex-row ml-auto w-auto gap-2">
          <button className="flex items-center justify-center bg-neutral-400 p-2 px-4 text-black shadow-md" onClick={() => setPreview(null)}>
            Revert
          </button>
          <button className="flex items-center justify-center bg-neutral-950 p-2 px-4 shadow-md" onClick={() => setPreview(null)}>
            Cancel
          </button>
        </div>
      </div>

      <DiffEditor
        className="min-h-[calc(100vh-8rem)] h-full grow"
        language="typescript"
        theme="vs-dark"
        loading={<CircularSpinner />}
        original={preview.currentText}
        modified={preview.newState.snapshot.text} />
    </div>
  )
}