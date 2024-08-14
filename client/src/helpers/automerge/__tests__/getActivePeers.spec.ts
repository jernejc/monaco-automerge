
import { describe, expect, test } from '@jest/globals';

import { getActivePeers } from "../getActivePeers";
import { config } from '../../../config';


describe("getActivePeers", () => {

  test("should return empty array if no active users found", () => {
    expect(getActivePeers({}, {}).length).toEqual(0);
  });

  test("should identify one active peer", () => {
    const peers = {
      test: {
        position: "position",
        selection: "selection",
        user: {
          id: "test"
        }
      }
    };

    const heartbeats = {
      test: Date.now()
    };

    expect(getActivePeers(peers, heartbeats)).toEqual([{
      user: {
        id: "test"
      },
      position: "position",
      selection: "selection"
    }]);
  });

  test("should ignore peers with older hearbeats", () => {
    const peers = {
      test: {
        position: "position",
        selection: "selection",
        user: {
          id: "test"
        }
      }
    };

    const heartbeats = {
      test: Date.now() - (config.defaults.activePeerTimeout + 1)
    };

    expect(getActivePeers(peers, heartbeats).length).toEqual(0);
  });
});