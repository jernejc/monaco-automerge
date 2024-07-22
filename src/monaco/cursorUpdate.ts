
import * as monaco from "monaco-editor";

export function cursorUpdate(editor: monaco.editor.ICodeEditor, position: any, user: string) {
  editor.addContentWidget({
    allowEditorOverflow: true,
    getDomNode: (): HTMLElement => {
      const existing = document.getElementById(user);

      if (existing)
        return existing;

      const { lineHeight } = getConfiguration(editor);
      const div = document.createElement("div");
      div.id = user
      div.className = 'monaco-remote-cursor'
      div.style.background = 'red';
      div.style.height = `${lineHeight}px`;

      const tooltip = document.createElement("div");
      tooltip.className = 'monaco-remote-cursor-tooltip'
      tooltip.style.background = 'red';
      tooltip.innerText = 'Name Hugoland';
      div.appendChild(tooltip);

      return div;
    },
    getId: () => {
      return user;
    },
    getPosition: () => {
      return {
        position: position || { column: 1, lineNumber: 1 },
        preference: [1, 2]
      };
    }
  });
}

function getConfiguration(editorInstance: monaco.editor.ICodeEditor): monaco.editor.IEditorOptions {
  // Support for Monaco < 0.19.0
  if (typeof (editorInstance as any).getConfiguration === "function") {
    return (editorInstance as any).getOptions();
  }

  return {
    lineHeight: editorInstance.getOption(monaco.editor.EditorOption.lineHeight)
  };
}