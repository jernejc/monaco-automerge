import { Position, Selection } from "monaco-editor";

import { User } from "@/types";

export type Peer = {
  user: User;
  position?: Position;
  selection?: Selection;
}