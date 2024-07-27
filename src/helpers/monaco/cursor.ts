import { editor, IDisposable, IPosition } from "monaco-editor";
import { User } from "../../types";

type IConfiguration = {
  lineHeight: number;
}

/**
 * 
 * This class implements a Monaco Content Widget to render a remote user"s
 * cursor, and an optional tooltip.
 * 
 * Based on: https://github.com/convergencelabs/monaco-collab-ext/blob/master/src/ts/RemoteCursorWidget.ts
 *
 */

export class CursorWidget implements editor.IContentWidget, IDisposable {

  id: string;
  user: User;
  editor: editor.ICodeEditor;
  domNode: HTMLDivElement;
  tooltipNode: HTMLDivElement | null;
  tooltipDuration: number;
  position: editor.IContentWidgetPosition | null = null;
  offset: number;
  hideTimer: any;
  disposed: boolean;

  constructor(editor: editor.ICodeEditor,
    user: User,
    position: IPosition,
    tooltipEnabled: boolean = true,
    tooltipDuration: number = 2000,
    showTooltipOnHover: boolean = true) {

    this.editor = editor;
    this.tooltipDuration = tooltipDuration;
    this.id = `monaco-remote-cursor-${user.id}`;
    this.user = user;

    this.updatePosition(position);

    let { lineHeight } = getConfiguration(this.editor);

    if (!lineHeight || lineHeight <= 17) // often returns unreasonable value
      lineHeight = 17;

    this.domNode = document.createElement("div");
    this.domNode.className = "monaco-remote-cursor"
    this.domNode.style.background = user.color;
    this.domNode.style.height = `${lineHeight}px`;

    if (tooltipEnabled) {
      this.tooltipNode = document.createElement("div");
      this.tooltipNode.className = "monaco-remote-cursor-tooltip"
      this.tooltipNode.style.background = user.color;
      this.tooltipNode.innerText = user.name;
      this.domNode.appendChild(this.tooltipNode);

      if (showTooltipOnHover) {
        this.domNode.style.pointerEvents = "auto";
        this.domNode.addEventListener("mouseover", () => {
          this.setTooltipVisible(true);
        })
        this.domNode.addEventListener("mouseout", () => {
          this.setTooltipVisible(false);
        })
      }
    } else {
      this.tooltipNode = null;
    }

    this.hideTimer = null;
    this.editor.addContentWidget(this);

    this.offset = -1;

    this.disposed = false;
  }

  hide() {
    this.domNode.style.display = "none";
  }

  show() {
    this.domNode.style.display = "inherit";
  }

  setOffset(offset: number) {
    const position = this.editor.getModel()!.getPositionAt(offset);

    if (position)
      this.setPosition(position);
  }

  setPosition(position: IPosition) {
    this.updatePosition(position);

    if (this.tooltipNode !== null) {
      setTimeout(() => this.showTooltip(), 0);
    }
  }

  dispose() {
    if (this.disposed)
      return;

    this.editor.removeContentWidget(this);

    this.disposed = true;
  }

  getDomNode() {
    return this.domNode;
  }

  getId() {
    return this.id;
  }

  getPosition() {
    return this.position;
  }

  updatePosition(position: IPosition) {
    this.position = {
      position: { ...position },
      preference: [editor.ContentWidgetPositionPreference.EXACT]
    };

    this.offset = this.editor.getModel()!.getOffsetAt(position);

    this.editor.layoutContentWidget(this);
  }

  showTooltip() {
    this.setTooltipVisible(true);

    this.hideTimer = setTimeout(() => {
      this.setTooltipVisible(false);
    }, this.tooltipDuration);
  }

  updateTooltipPosition() {
    const distanceFromTop = this.domNode.offsetTop - this.editor.getScrollTop();

    if (this.tooltipNode === null)
      return;

    if (distanceFromTop - this.tooltipNode.offsetHeight < 5) {
      this.tooltipNode.style.top = `${this.tooltipNode.offsetHeight + 2}px`;
    } else {
      this.tooltipNode.style.top = `-${this.tooltipNode.offsetHeight}px`;
    }

    this.tooltipNode.style.left = "0";
  }

  setTooltipVisible(visible: boolean) {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.tooltipNode === null)
      return;

    if (visible) {
      this.updateTooltipPosition();
      this.tooltipNode.style.opacity = "1.0";
    } else {
      this.tooltipNode.style.opacity = "0";
    }
  }
}

function getConfiguration(editorInstance: editor.ICodeEditor): IConfiguration {
  if (typeof (editorInstance as any).getConfiguration === "function") {
    return (editorInstance as any).getConfiguration();
  }

  return {
    lineHeight: editorInstance.getOption(editor.EditorOption.lineHeight)
  };
}