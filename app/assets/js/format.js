export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
export const number = value => value == null || value === '' || !Number.isFinite(Number(value)) ? '—' : new Intl.NumberFormat('en-US').format(Number(value));
export const money = value => value == null || value === '' || !Number.isFinite(Number(value)) ? '—' : new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', minimumFractionDigits: Number(value) % 1 ? 2 : 0, maximumFractionDigits:2 }).format(Number(value));
export const fee = value => value == null || Number(value) === 0 ? 'Free' : money(value);
export const date = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit', timeZone:'UTC', timeZoneName:'short' }).format(new Date(value)) : 'Not published';
export function timeLeft(value) {
  const remaining = Date.parse(value) - Date.now();
  if (!Number.isFinite(remaining)) return 'No deadline';
  if (remaining <= 0) return 'Entries closed';
  const mins = Math.floor(remaining / 60000), days = Math.floor(mins / 1440), hours = Math.floor(mins % 1440 / 60);
  return days ? `${days}d ${hours}h left` : hours ? `${hours}h ${mins % 60}m left` : `${mins}m left`;
}
export const taking = b => b.status === 'open' && Number.isFinite(Date.parse(b.deadline)) && Date.parse(b.deadline) > Date.now() && b.acceptingSubmissions !== false;
export const urgent = b => taking(b) && Date.parse(b.deadline) - Date.now() < 86400000;
export const state = b => !Number.isFinite(Date.parse(b.deadline)) ? 'Deadline unavailable' : taking(b) ? (urgent(b) ? 'Closing soon' : 'Open') : 'Entries closed';
export const bountyPath = slug => `#/bounty/${encodeURIComponent(slug)}`;
export const profilePath = handle => `#/account/${encodeURIComponent(handle)}`;
export function prose(text) {
  if (!text) return '<p class="muted">No description has been published.</p>';
  return esc(text).split(/\n{2,}/).map(block => {
    const lines = block.split('\n');
    if (/^#{1,4} /.test(lines[0])) {
      const title = lines.shift().replace(/^#{1,4} /, '');
      return `<h3>${title}</h3>${lines.length ? `<p>${lines.join('<br>')}</p>` : ''}`;
    }
    if (lines.every(line => /^[-*] /.test(line))) return `<ul>${lines.map(line => `<li>${line.slice(2)}</li>`).join('')}</ul>`;
    return `<p>${lines.join('<br>')}</p>`;
  }).join('');
}
