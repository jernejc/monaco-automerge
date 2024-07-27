
import { editor, Range, IPosition, Selection } from "monaco-editor";
import { User } from "../../types";

/**
 * 
 * A Monaco Editor Delta Decoration to render a remote user"s selection.
 * 
 * Based on: https://github.com/convergencelabs/monaco-collab-ext/blob/master/src/ts/RemoteSelection.ts
 *
 */

export class SelectionDecoration {

  user: User
  className: string;
  styleElement: HTMLStyleElement;
  editor: editor.ICodeEditor;

  startPosition: IPosition = { lineNumber: 0, column: 0 };
  endPosition: IPosition = { lineNumber: 0, column: 0 };
  decorations: string[];
  disposed: boolean = false;

  constructor(
    codeEditor: editor.ICodeEditor,
    user: User,
    selection: Selection,
  ) {
    this.editor = codeEditor;
    this.user = user;
    
    const uniqueClassId = `monaco-remote-selection-${user.id}`;

    this.className = `monaco-remote-selection ${uniqueClassId}`;
    this.styleElement = SelectionDecoration.addDynamicStyleElement(uniqueClassId, user.color);
    this.decorations = [];

    const { start, end } = SelectionDecoration.getStartEndFromSelection(selection);

    this.setPositions(start, end);
  }

  getId() {
    return this.user.id;
  }

  getStartPosition(): IPosition {
    return { ...this.startPosition };
  }

  getEndPosition(): IPosition {
    return { ...this.endPosition };
  }

  setOffsets(start: number, end: number) {
    const startPosition = this.editor.getModel()!.getPositionAt(start);
    const endPosition = this.editor.getModel()!.getPositionAt(end);

    this.setPositions(startPosition, endPosition);
  }

  setPositions(start: IPosition, end: IPosition) {
    this.decorations = this.editor.deltaDecorations(this.decorations, []);
    const ordered = SelectionDecoration.swapIfNeeded(start, end);
    this.startPosition = ordered.start;
    this.endPosition = ordered.end;
    this.render();
  }

  show() {
    this.render();
  }

  hide() {
    this.decorations = this.editor.deltaDecorations(this.decorations, []);
  }

  dispose() {
    if (!this.disposed) {
      this.styleElement.parentElement!.removeChild(this.styleElement);
      this.hide();
      this.disposed = true;
    }
  }

  render() {
    this.decorations = this.editor.deltaDecorations(this.decorations,
      [
        {
          range: new Range(
            this.startPosition.lineNumber,
            this.startPosition.column,
            this.endPosition.lineNumber,
            this.endPosition.column
          ),
          options: {
            className: this.className,
            hoverMessage: this.user.name != null ? {
              value: this.user.name
            } : null
          }
        }
      ]
    );
  }

  static addDynamicStyleElement(className: string, color: string): HTMLStyleElement {

    const css =
      `.${className} {
         background-color: ${color};
       }`.trim();

    const styleElement = document.createElement("style");
    styleElement.innerText = css;
    document.head.appendChild(styleElement);

    return styleElement;
  }

  static swapIfNeeded(start: IPosition, end: IPosition): { start: IPosition, end: IPosition } {
    if (start.lineNumber < end.lineNumber || (start.lineNumber === end.lineNumber && start.column <= end.column)) {
      return { start, end };
    } else {
      return { start: end, end: start };
    }
  }

  static getStartEndFromSelection(selection: Selection): { start: IPosition, end: IPosition } {
    return SelectionDecoration.swapIfNeeded(
      { lineNumber: selection.startLineNumber, column: selection.startColumn },
      { lineNumber: selection.endLineNumber, column: selection.endColumn }
    );
  }
}