const cache = new Map();
export async function get(path, fresh = false) {
  const old = cache.get(path);
  if (!fresh && old && Date.now() - old.time < 60000) return old.data;
  const headers = old?.etag ? {'If-None-Match':old.etag} : {};
  const response = await fetch('https://make.fun/api' + path, {headers});
  if (response.status === 304 && old) { old.time=Date.now(); return old.data; }
  if (!response.ok) throw new Error(response.status === 429 ? 'Rate limit reached. Please wait a moment and retry.' : `Request failed (${response.status}).`);
  const data = await response.json(); cache.set(path,{data,time:Date.now(),etag:response.headers.get('ETag')}); return data;
}
