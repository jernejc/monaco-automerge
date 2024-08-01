import { Position, Selection } from "monaco-editor";

import { User } from "./user";

export type Peer = {
  user: User;
  position?: Position;
  selection?: Selection;
}