
import { EditPayloadType } from "../types/payload";

export type ChangePatch = {
  type: EditPayloadType;
  value: string;
  length?: number;
  index: number;
}