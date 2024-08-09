import { ChangePatch } from './changePatch'

export type ChangeMeta = {
  patches: ChangePatch[]
  head: string
}