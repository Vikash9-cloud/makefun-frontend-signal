export function route() {
  const fragment = location.hash.slice(1) || '/';
  const [path, query = ''] = fragment.split('?');
  const parts = path.split('/').filter(Boolean);
  try {
    if (!parts.length) return { name:'board', query:new URLSearchParams(query) };
    if (parts[0] === 'bounty' && parts[1] && parts.length <= 3 && (!parts[2] || parts[2] === 'leaderboard')) return { name:parts[2] ? 'leaderboard' : 'bounty', slug:decodeURIComponent(parts[1]) };
    if (parts[0] === 'account' && parts.length === 1) return { name:'profile-search' };
    if (parts[0] === 'account' && parts[1] && parts.length === 2) return { name:'profile', handle:decodeURIComponent(parts[1]) };
  } catch {}
  return { name:'missing' };
}
export function replaceBoardQuery(query) {
  const suffix = query.toString();
  history.replaceState(null, '', `#/${suffix ? `?${suffix}` : ''}`);
}
