
export enum EventLogType {
  LOCAL = "local",
  REMOTE = "remote"
}

export type EventLogPayload = {
  value: EventLogType
}