const base = 'https://make.fun/api';
const cache = new Map();
const inflight = new Map();
const ttl = 30000;

export async function get(path, force = false) {
  const saved = cache.get(path);
  if (!force && saved && Date.now() - saved.time < ttl) return saved.data;
  if (inflight.has(path)) return inflight.get(path);
  const request = (async () => {
    const headers = saved?.etag ? { 'If-None-Match': saved.etag } : {};
    const response = await fetch(base + path, { headers, credentials: 'omit' });
    if (response.status === 304 && saved) {
      saved.time = Date.now();
      return saved.data;
    }
    if (!response.ok) {
      const error = new Error(response.status === 429 ? 'The public API is rate limiting requests.' : `The public API returned ${response.status}.`);
      error.status = response.status;
      error.retryAfter = response.headers.get('Retry-After');
      throw error;
    }
    const payload = await response.json();
    if (payload?.success === false) throw new Error(payload.error?.[0]?.message || 'The public API could not complete the request.');
    const data = path.startsWith('/profiles/') ? {
      handle:payload.handle, joined_at:payload.joined_at, record:payload.record,
      solutions:(payload.solutions || []).map(({ title, competition, placement, prize_usd, entered_at }) => ({ title, competition:competition && { slug:competition.slug, title:competition.title }, placement, prize_usd, entered_at }))
    } : payload;
    cache.set(path, { data, etag: response.headers.get('ETag'), time: Date.now() });
    return data;
  })();
  inflight.set(path, request);
  try { return await request; } finally { inflight.delete(path); }
}

export async function getBoard(force = false) {
  let path = '/competitions?status=open&activity=times';
  const items = [];
  do {
    const page = await get(path, force);
    items.push(...(page.items || []));
    path = page.next_cursor ? `/competitions?status=open&activity=times&cursor=${encodeURIComponent(page.next_cursor)}` : '';
  } while (path);
  return items;
}
export const getBounty = (slug, force) => get(`/competitions/${encodeURIComponent(slug)}`, force);
export const getLeaderboard = (slug, force) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`, force);
export const getProfile = (handle, force) => get(`/profiles/${encodeURIComponent(handle)}`, force);
