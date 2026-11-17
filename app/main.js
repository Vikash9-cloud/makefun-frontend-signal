const API = 'https://make.fun/api';
const root = document.querySelector('#content');
const cache = new Map();
let renderId = 0;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => value == null ? 'Free' : '$' + Number(value).toLocaleString('en-US', {maximumFractionDigits: 2});
const number = value => Number(value || 0).toLocaleString('en-US');
const date = value => value ? new Date(value).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : 'Not set';
const left = value => { const ms = new Date(value) - Date.now(); if (!value) return 'Date TBA'; if (ms <= 0) return 'Entries closed'; const h = Math.ceil(ms / 3600000); return h < 48 ? `${h}h left` : `${Math.ceil(h / 24)} days left`; };
const href = (kind, id) => `#/${kind}/${encodeURIComponent(id)}`;
async function get(path, refresh = false) {
  const old = cache.get(path);
  if (old && !refresh && Date.now() - old.time < 60000) return old.data;
  const response = await fetch(API + path, {headers: old?.etag ? {'If-None-Match': old.etag} : {}});
  if (response.status === 304 && old) { old.time = Date.now(); return old.data; }
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  const data = await response.json(); cache.set(path, {data, etag: response.headers.get('ETag'), time: Date.now()}); return data;
}
const summary = b => (b.description || '').split('\n')[0];
const status = b => new Date(b.deadline) > Date.now() && b.status === 'open' ? 'Open for entries' : b.status === 'resolved' ? 'Completed' : 'Entries closed';
const icon = '<span class="arrow" aria-hidden="true">↗</span>';
function boardRow(b) { return `<a class="bounty-row" href="${href('bounty',b.slug)}"><span class="row-icon">${esc((b.category || 'C').slice(0,1))}</span><span class="row-main"><strong>${esc(b.title)}</strong><small>${esc(b.category || 'Competition')} <span> / </span> ${esc(b.sponsor?.name || 'make.fun')}</small></span><span class="metric"><small>Live pot</small><strong>${money(b.potUsd ?? b.rewardAmount)}</strong></span><span class="metric"><small>Entry fee</small><strong>${money(b.entryFeeUsd)}</strong></span><span class="metric"><small>Deadline</small><strong>${left(b.deadline)}</strong></span><span class="metric entries"><small>Entries</small><strong>${number(b.submissionCount)}</strong></span>${icon}</a>`; }
async function board() {
  const data = await get('/competitions');
  const items = data.items || [];
  const open = items.filter(b => b.status === 'open' && new Date(b.deadline) > Date.now()).sort((a,b) => new Date(a.deadline)-new Date(b.deadline));
  const closed = items.filter(b => !open.includes(b)).sort((a,b) => new Date(b.deadline)-new Date(a.deadline));
  root.innerHTML = `<section class="page-intro"><div><p class="section-name">The competition board</p><h1>Find your next<br>good challenge<span class="period">.</span></h1><p class="lede">A live view of the ideas, builds, and experiments happening on make.fun.</p></div><div class="intro-side"><span class="signal-symbol" aria-hidden="true">✳</span><div><strong>${open.length} open competitions</strong><p>Pick a challenge. See what the community is building.</p></div></div></section><section class="board-section"><div class="section-head"><div><h2>Open competitions <span class="count">${open.length}</span></h2><p>Currently accepting entries, ordered by deadline.</p></div><label class="search"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Search competitions" aria-label="Search competitions"></label></div><div id="board-list">${open.map(boardRow).join('') || '<p class="empty">No competitions are accepting entries right now.</p>'}</div><div class="section-head closed-head"><div><h2>Recently closed</h2><p>Explore past challenges and their results.</p></div></div><div id="closed-list">${closed.slice(0,5).map(boardRow).join('')}</div><button class="text-button" id="more">Show more competitions</button></section>`;
  const search = document.querySelector('#search');
  search.addEventListener('input', () => { const q = search.value.toLowerCase().trim(); document.querySelector('#board-list').innerHTML = open.filter(b => `${b.title} ${b.category} ${b.skills?.join(' ')}`.toLowerCase().includes(q)).map(boardRow).join('') || '<p class="empty">No matching open competitions.</p>'; });
  document.querySelector('#more').addEventListener('click', e => { document.querySelector('#closed-list').innerHTML = closed.map(boardRow).join(''); e.currentTarget.remove(); });
}
function tabs(b, selected) { return `<nav class="tabs" aria-label="Competition"><a class="${selected==='overview'?'active':''}" href="${href('bounty',b.slug)}">Overview</a><a class="${selected==='leaderboard'?'active':''}" href="${href('leaderboard',b.slug)}">Leaderboard</a></nav>`; }
function bountyHeader(b) { return `<div class="crumb"><a href="#/">Competitions</a><span>/</span><span>${esc(b.category || 'Bounty')}</span></div><div class="detail-heading"><div><div class="status"><i></i>${status(b)}</div><h1>${esc(b.title)}</h1><p>Hosted by <strong>${esc(b.sponsor?.name || 'make.fun')}</strong></p></div><span class="detail-glyph" aria-hidden="true">✳</span></div><div class="stats"><div><small>Live reward pot</small><strong>${money(b.potUsd ?? b.rewardAmount)}</strong><span>Includes entry fees</span></div><div><small>Entry fee</small><strong>${money(b.entryFeeUsd)}</strong><span>Per account</span></div><div><small>Deadline</small><strong>${left(b.deadline)}</strong><span>${date(b.deadline)}</span></div><div><small>Entries</small><strong>${number(b.submissionCount)}</strong><span>Submissions</span></div></div>`; }
async function bounty(slug) {
  const b = await get('/competitions/' + encodeURIComponent(slug));
  root.innerHTML = `<div class="detail">${bountyHeader(b)}${tabs(b,'overview')}<div class="detail-grid"><article><h2>About this competition</h2><p class="summary">${esc(summary(b))}</p><h3>Brief &amp; rules</h3><div class="description">${esc(b.description || 'No description provided.')}</div></article><aside><div class="aside-head"><div><h2>Rewards</h2><p>Live prize breakdown</p></div><strong>${money(b.potUsd ?? b.rewardAmount)}</strong></div><div class="reward-list">${(b.rewardsNow || []).map(r => `<div><span>Place ${number(r.place)}</span><strong>${money(r.amountUsd)}</strong></div>`).join('') || '<p class="empty">Prize details are not available.</p>'}</div><div class="aside-foot">Published ${date(b.publishedAt)}<br>Deadline ${date(b.deadline)}</div></aside></div></div>`;
}
async function leaderboard(slug) {
  const [b, board] = await Promise.all([get('/competitions/' + encodeURIComponent(slug)), get('/competitions/' + encodeURIComponent(slug) + '/leaderboard')]);
  const entries = board.entries || [];
  root.innerHTML = `<div class="detail">${bountyHeader(b)}${tabs(b,'leaderboard')}<div class="section-head rank-head"><div><h2>Leaderboard <span class="count">${number(entries.length)}</span></h2><p>${esc(board.phase?.title || 'Competition')} standings${board.metrics_withheld ? ' · some metrics are withheld' : ''}</p></div></div><div class="rank-table"><div class="rank-label"><span>Rank</span><span>Builder / entry</span><span>Score</span><span>Status</span></div><div id="rank-rows"></div></div><button id="rank-more" class="text-button">Show more entries</button></div>`;
  let shown = 0; const rows = document.querySelector('#rank-rows'); const button = document.querySelector('#rank-more');
  function more() { const batch = entries.slice(shown, shown + 30); rows.insertAdjacentHTML('beforeend', batch.map(e => `<div class="rank-row"><strong class="rank">${e.rank ? '#' + e.rank : '—'}</strong><div><a href="${href('profile',e.handle)}" class="person"><span class="avatar">${esc((e.handle || '?').slice(0,1).toUpperCase())}</span><strong>${esc(e.handle || 'Unknown')}</strong></a><small>${esc(e.title || 'Entry')}</small></div><strong>${esc(e.display?.[board.rank_key] ?? '—')}</strong><span class="rank-status">${esc(e.status || '—')}</span></div>`).join('')); shown += batch.length; button.hidden = shown >= entries.length; }
  button.addEventListener('click', more); more(); if (!entries.length) rows.innerHTML = '<p class="empty">No standings available yet.</p>';
}
async function profile(handle) {
  const p = await get('/profiles/' + encodeURIComponent(handle)); const r = p.record || {};
  root.innerHTML = `<div class="detail profile"><div class="crumb"><a href="#/">Competitions</a><span>/</span><span>Builder profile</span></div><div class="profile-heading"><span class="profile-avatar">${esc((p.handle || '?').slice(0,1).toUpperCase())}</span><div><p class="section-name">Builder profile</p><h1>${esc(p.display_name || p.handle)}</h1><p>@${esc(p.handle)} · Joined ${date(p.joined_at)}</p></div></div><p class="profile-bio">${esc(p.bio || 'Building and competing on make.fun.')}</p><div class="stats"><div><small>Competitions</small><strong>${number(r.competitions_entered)}</strong><span>Entered</span></div><div><small>Wins</small><strong>${number(r.competitions_won)}</strong><span>First places</span></div><div><small>Podiums</small><strong>${number(r.podium_finishes)}</strong><span>Top three finishes</span></div><div><small>Prizes</small><strong>${money(r.prize_usd)}</strong><span>Total earned</span></div></div><div class="section-head rank-head"><div><h2>Competition history</h2><p>Public entries from this builder.</p></div></div><div class="history">${(p.solutions || []).slice(0,30).map(s => `<a href="${href('bounty',s.competition?.slug)}"><span><strong>${esc(s.competition?.title)}</strong><small>${esc(s.title)}</small></span><span>${s.placement ? '#' + s.placement : 'Entered'} ${icon}</span></a>`).join('') || '<p class="empty">No public entries yet.</p>'}</div></div>`;
}
async function route() {
  const id = ++renderId; window.__shotReady = false; root.innerHTML = '<div class="loading">Loading live data…</div>';
  const [kind, name] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  try { if (kind === 'bounty' && name) await bounty(name); else if (kind === 'leaderboard' && name) await leaderboard(name); else if (kind === 'profile' && name) await profile(name); else await board(); }
  catch (error) { if (id === renderId) root.innerHTML = `<div class="error"><h1>Could not load this page</h1><p>${esc(error.message)}. Check your connection and try again.</p><button id="retry">Try again</button> <a href="#/">Back to competitions</a></div>`; document.querySelector('#retry')?.addEventListener('click', route); }
  if (id === renderId) { window.__shotReady = true; document.title = (kind ? kind[0].toUpperCase() + kind.slice(1) + ' | ' : '') + 'Signal'; }
}
window.addEventListener('hashchange', route); route();
