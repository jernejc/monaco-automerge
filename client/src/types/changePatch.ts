
import { EditPayloadType } from "@/types";

export type ChangePatch = {
  type: EditPayloadType;
  value: string;
  length?: number;
  index: number;
}