import { describe, expect, test } from "@jest/globals";

import { CursorWidget } from "@/helpers/monaco/cursor";

import { editorInstance, user, position } from "@/helpers/monaco/__mocks__/editor";


describe("CursorWidget", () => {

  test("should create a new CursorWidget instance", () => {
    const cursor = new CursorWidget(editorInstance, user, position);

    expect(cursor).toBeInstanceOf(CursorWidget);
  });

  test("should update position", () => {
    const cursor = new CursorWidget(editorInstance, user, position);

    cursor.updatePosition(position);

    expect(cursor.position).toEqual({
      position: position,
      preference: [0],
    });
  });

  test("should dispose cursor", () => {
    const cursor = new CursorWidget(editorInstance, user, position);

    cursor.dispose();

    expect(cursor.disposed).toBeTruthy();
  });

  test("should show tooltip on hover", () => {
    const cursor = new CursorWidget(editorInstance, user, position);

    cursor.showTooltip();

    expect(cursor.tooltipNode?.style.opacity).toEqual("1");

    cursor.dispose();

    expect(cursor.disposed).toBeTruthy();
  });
});