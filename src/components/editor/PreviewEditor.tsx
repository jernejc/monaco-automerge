import { DiffEditor } from "@monaco-editor/react";

import { Preview } from "../../types";

import { CircularSpinner } from "./CircularSpinner";

export function PreviewEditor({ preview, setPreview }: { preview: Preview, setPreview: any }) {

  return (
    <>
      <div className="flex flex-row px-4 py-2 pr-2 items-center">
        <span className="text-lg font-bold">#{preview.head}</span>

        <div className="flex flex-row ml-auto w-auto gap-2">
          <button className="flex items-center justify-center bg-neutral-900 hover:bg-neutral-700 p-2 px-4" onClick={() => setPreview(null)}>
            Revert
          </button>
          <button className="flex items-center justify-center bg-neutral-900 hover:bg-neutral-700 p-2 px-4" onClick={() => setPreview(null)}>
            Close
          </button>
        </div>
      </div>

      <DiffEditor
        className="min-h-[calc(100vh-4rem)] h-full grow"
        language="typescript"
        theme="vs-dark"
        loading={<CircularSpinner />}
        original={preview.currentState.snapshot.text}
        modified={preview.newState.snapshot.text} />
    </>
  )
}