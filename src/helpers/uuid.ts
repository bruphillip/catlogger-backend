export function isUuid(uuid: string) {
  const re = /^([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)$/i
  return re.test(uuid)
}
