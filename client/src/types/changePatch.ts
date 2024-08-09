
import { ContentActionType } from "../reducers/editorContentReducer";

export type ChangePatch = {
  actionType: ContentActionType;
  action: string;
  value: string;
  path: any[]
  length?: number;
  index?: number;
}