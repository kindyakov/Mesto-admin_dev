export function objStr(data) {
  return JSON.stringify(data).replace(/\s+/g, '').replace(/"/g, '&quot;');
}