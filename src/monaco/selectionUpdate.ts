
import * as monaco from "monaco-editor";

export function selectionUpdate(editor: monaco.editor.ICodeEditor, start: monaco.IPosition, end: monaco.IPosition, user: string) {
  editor.deltaDecorations(
    [],
    [
      {
        range: new monaco.Range(
          start.lineNumber,
          start.column,
          end.lineNumber,
          end.column
        ),
        options: {
          className: 'monaco-remote-selection',
          isWholeLine: false,
          hoverMessage: {
            value: user
          }
        }
      }
    ]
  );
}