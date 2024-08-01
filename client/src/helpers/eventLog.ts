
/**
 * Used to follow local and remote updates on MonacoEditor / Automerge
 * Local edits should be ignored when remote updates are received and vice versa
 * 
 * Disccussion on the topic
 * https://github.com/microsoft/monaco-editor/discussions/3628
 */

export enum EventLogType {
  LOCAL = "local",
  REMOTE = "remote"
}

export function removeEventLog(array: EventLogType[], value: EventLogType): boolean {
  //console.log('removeEventLog', array, value)

  const index = array.indexOf(value);

  if (index > -1) {
    array.splice(index, 1);
    return true
  }
  
  return false
}

export function addEventLog(array: EventLogType[], value: EventLogType): boolean {
  //console.log('addEventLog', array, value)

  array.push(value);

  return true
}