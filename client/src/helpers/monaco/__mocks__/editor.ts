import { editor, Selection, Position } from "monaco-editor";

import { User } from "@/types";


// @ts-ignore
export const user: jest.Mocked<User> = {
  id: "test",
};

// @ts-ignore
export const position: jest.Mocked<Position> = {
  lineNumber: 1,
  column: 2
};

// @ts-ignore
export const selection: jest.Mocked<Selection> = {
  getStartPosition: jest.fn(() => position),
  getEndPosition: jest.fn(() => position),
  
  startLineNumber: 1,
  startColumn: 1,
  endLineNumber: 2,
  endColumn: 2,
};

// @ts-ignore
export const editorInstance: jest.Mocked<editor.ICodeEditor> = {
  layoutContentWidget: jest.fn(),
  addContentWidget: jest.fn(),
  removeContentWidget: jest.fn(),
  getOption: jest.fn(),
  getScrollTop: jest.fn(),
  deltaDecorations: jest.fn(),
  // @ts-ignore
  getModel: jest.fn((): jest.Mocked<editor.ITextModel> => ({
    // @ts-ignore
    getOffsetAt: jest.fn(() => 1),
    // @ts-ignore
    getPositionAt: jest.fn(() => (position))
  })),
};
