export function dataStr(data) {
  return JSON.stringify(data).replace(/\s+/g, '').replace(/"/g, '&quot;')
}