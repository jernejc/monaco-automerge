
import { describe, expect, test } from '@jest/globals';

import { getRecentChangeMeta } from "../getRecentChangeMeta";


describe("getRecentChangeMeta", () => {

  test("should return null if no metaSymbol", () => {
    // @ts-ignore
    expect(getRecentChangeMeta({})).toBe(null);
  });

  test("should return patches and head", () => {
    const doc = {
      [Symbol("test")]: {
        mostRecentPatch: {
          patches: [
            {
              action: "del",
              actionType: "del",
              length: 4,
              path: ['text', 71]
            },
            {
              action: "splice",
              actionType: "splice",
              length: 8,
              path: ['text', 94],
              value: "new text"
            }
          ],
          after: ["test"]
        }
      }
    };

    // @ts-ignore
    expect(getRecentChangeMeta(doc)).toEqual({
      patches: [
        {
          type: "del",
          length: 4,
          index: 71
        },
        {
          type: "splice",
          length: 8,
          index: 94,
          value: "new text"
        }
      ],
      head: "test"
    });
  });
});