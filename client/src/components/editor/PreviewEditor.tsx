import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { DiffEditor } from "@monaco-editor/react";

import { AnyDocumentId, updateText } from "@automerge/automerge-repo";
import { useDocument } from "@automerge/automerge-repo-react-hooks";

import { Document } from "../../types";

import { CircularSpinner } from "./CircularSpinner";
import { getHashSnapshot } from "../../helpers/automerge/getHashSnapshot";


export function PreviewEditor() {

  const navigate = useNavigate();

  const { docUrl } = useParams<"docUrl">() as { docUrl: AnyDocumentId };
  const { changeId } = useParams<"changeId">() as { changeId: string };

  const [doc, changeDoc] = useDocument<Document>(docUrl);

  const [statePreview, setStatePreview] = useState<string>('');

  const revert = useCallback(() => {
    if (doc) {
      changeDoc(currentDoc => updateText(currentDoc, ["text"], statePreview));
      navigate(`/${docUrl}`)
    }
  }, [doc, statePreview]);

  useEffect(() => {
    if (doc)
      setStatePreview(getHashSnapshot(doc, changeId));
  }, [doc, changeId]);

  return (
    <div className="min-h-[calc(100vh-4rem)] h-full w-full overflow-hidden">
      <div className="flex flex-row px-4 items-center h-16">
        <span className="text-lg font-bold"># {changeId}</span>

        <div className="flex flex-row ml-auto w-auto gap-2">
          <button className="flex items-center justify-center bg-neutral-400 p-2 px-4 text-black shadow-md" onClick={revert}>
            Apply
          </button>
          <button className="flex items-center justify-center bg-neutral-950 p-2 px-4 shadow-md" onClick={() => navigate(`/${docUrl}`)}>
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
        modified={statePreview} />
    </div>
  )
}