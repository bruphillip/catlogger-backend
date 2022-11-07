export function getAllAfter<T>(array: T[], current: T) {
  const i = array.indexOf(current)
  return i > -1 ? array.slice(i + 1, array.length) : []
}
