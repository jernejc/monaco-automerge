import { describe, expect, test } from "@jest/globals";

import { SelectionDecoration } from "@/helpers/monaco/selection";

import { editorInstance, user, selection, position } from "@/helpers/monaco/__mocks__/editor";


describe("SelectionDecoration", () => {

  test("should create a new Selection instance", () => {
    const selectionDecoration = new SelectionDecoration(editorInstance, user, selection);

    expect(selectionDecoration).toBeInstanceOf(SelectionDecoration);
  });

  test("should update selection positions", () => {
    const selectionDecoration = new SelectionDecoration(editorInstance, user, selection);

    const { end } = SelectionDecoration.getStartEndFromSelection(selection);
    selectionDecoration.setPositions(position, end); // set start position to mocked position value

    expect(selectionDecoration.startPosition).toEqual(position);
  });

  test("should dispose selection", () => {
    const selectionDecoration = new SelectionDecoration(editorInstance, user, selection);

    selectionDecoration.dispose();

    expect(selectionDecoration.disposed).toBeTruthy();
  });
});