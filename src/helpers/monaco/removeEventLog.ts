export function removeEventLog(array: string[], value: string): boolean {
  const index = array.indexOf(value);

  if (index > -1) {
    array.splice(index, 1);
    return true
  }
  
  return false
}