import { esc, number, money, fee, timeLeft, state, taking, urgent, bountyPath } from '../format.js';
import { replaceBoardQuery } from '../router.js';

function boardRow(b) {
  return `<a class="bounty-row" href="${bountyPath(b.slug)}"><div class="row-title"><span class="category">${esc(b.category || 'Bounty')}</span><strong>${esc(b.title)}</strong><span class="row-slug">${esc(b.slug)}</span></div><div class="row-value"><strong>${money(b.potUsd ?? b.rewardAmount)}</strong><small>live pot</small></div><div class="row-fee"><strong>${fee(b.entryFeeUsd)}</strong><small>entry fee</small></div><div class="row-time ${urgent(b) ? 'urgent' : ''}"><strong data-deadline="${esc(b.deadline)}">${timeLeft(b.deadline)}</strong><small>${number(b.submissionCount)} entries</small></div><span class="row-arrow" aria-hidden="true">↗</span></a>`;
}
function featured(b) {
  if (!b) return '<div class="empty">No bounty is currently accepting entries.</div>';
  return `<section class="feature"><div class="feature-top"><span class="feature-tag">In focus</span><span class="status ${urgent(b) ? 'warning' : ''}">${state(b)}</span></div><h2>${esc(b.title)}</h2><p>${esc(b.summary || 'Explore the bounty, its rewards and the live leaderboard.')}</p><div class="feature-money"><div><span>Live prize pot</span><strong>${money(b.potUsd ?? b.rewardAmount)}</strong><small>${money(b.rewardAmount)} base reward</small></div><div><span>Entry fee</span><strong>${fee(b.entryFeeUsd)}</strong><small>${number(b.submissionCount)} entries</small></div></div><div class="feature-deadline"><span>Time remaining</span><strong data-deadline="${esc(b.deadline)}">${timeLeft(b.deadline)}</strong></div><div class="feature-links"><a class="button primary" href="${bountyPath(b.slug)}">Explore bounty <span>↗</span></a><a class="button secondary" href="${bountyPath(b.slug)}/leaderboard">Leaderboard</a></div></section>`;
}
export function renderBoard(root, items, query) {
  const open = items.filter(taking);
  const focus = [...open].sort((a,b) => Date.parse(a.deadline) - Date.parse(b.deadline))[0];
  const pot = open.reduce((sum, b) => sum + Number(b.potUsd ?? b.rewardAmount ?? 0), 0);
  root.innerHTML = `<div class="page board-page"><div class="board-heading"><div><div class="section-label"><span class="signal-line"></span> THE OPPORTUNITY BOARD</div><h1>Find your next<br><em>winning idea.</em></h1><p>Live bounties for people building with AI.</p></div><div class="market-totals"><div><strong>${number(open.length)}</strong><span>open bounties</span></div><div><strong>${money(pot)}</strong><span>in live pots</span></div><div><strong>${number(open.reduce((s,b) => s + Number(b.submissionCount || 0),0))}</strong><span>entries so far</span></div></div></div><div class="board-layout"><section class="list-panel" aria-labelledby="board-title"><div class="panel-heading"><div><h2 id="board-title">Bounty board</h2><p>Opportunities, ordered for action.</p></div><span class="list-count" id="result-count"></span></div><form class="filters" id="filters"><label class="search"><span aria-hidden="true">⌕</span><span class="sr-only">Search bounties</span><input name="q" type="search" placeholder="Search bounties" value="${esc(query.get('q') || '')}"></label><label><span class="sr-only">Filter by status</span><select name="status"><option value="open">Accepting entries</option><option value="all">All statuses</option><option value="closed">Entries closed</option></select></label><label><span class="sr-only">Filter by entry fee</span><select name="fee"><option value="all">Any fee</option><option value="free">Free entry</option><option value="paid">Paid entry</option></select></label><label><span class="sr-only">Sort bounties</span><select name="sort"><option value="time">Closing soon</option><option value="reward">Highest pot</option><option value="fee">Lowest fee</option><option value="entries">Most entries</option></select></label></form><div class="list-labels" aria-hidden="true"><span>Bounty</span><span>Live pot</span><span>Entry</span><span>Deadline</span></div><div id="bounty-list"></div></section><aside class="feature-wrap">${featured(focus)}<div class="aside-note"><span class="note-symbol">✳</span><div><strong>Know what is at stake.</strong><p>Pots include paid entry fees when the API reports them. Deadlines determine whether entries are still open.</p></div></div></aside></div></div>`;
  const form = root.querySelector('#filters');
  for (const name of ['status','fee','sort']) if ([...form.elements[name].options].some(o => o.value === query.get(name))) form.elements[name].value = query.get(name);
  const update = () => {
    const data = new FormData(form), q = String(data.get('q')).trim().toLowerCase(), status = data.get('status'), feeFilter = data.get('fee'), sort = data.get('sort');
    const filtered = items.filter(b => (!q || `${b.title} ${b.slug} ${b.category}`.toLowerCase().includes(q)) && (status === 'all' || (status === 'open' ? taking(b) : !taking(b))) && (feeFilter === 'all' || (feeFilter === 'free' ? !Number(b.entryFeeUsd) : Number(b.entryFeeUsd) > 0)));
    filtered.sort((a,b) => sort === 'reward' ? Number(b.potUsd ?? b.rewardAmount ?? 0) - Number(a.potUsd ?? a.rewardAmount ?? 0) : sort === 'fee' ? Number(a.entryFeeUsd || 0) - Number(b.entryFeeUsd || 0) : sort === 'entries' ? Number(b.submissionCount || 0) - Number(a.submissionCount || 0) : (taking(b) - taking(a)) || ((Date.parse(a.deadline) || Infinity) - (Date.parse(b.deadline) || Infinity)));
    root.querySelector('#result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'bounty' : 'bounties'}`;
    root.querySelector('#bounty-list').innerHTML = filtered.map(boardRow).join('') || '<div class="empty"><strong>No matching bounties</strong><p>Try a different search or clear a filter.</p><button type="button" id="clear-filters">Clear filters</button></div>';
    const params = new URLSearchParams();
    if (q) params.set('q', data.get('q').trim());
    if (status !== 'open') params.set('status', status);
    if (feeFilter !== 'all') params.set('fee', feeFilter);
    if (sort !== 'time') params.set('sort', sort);
    replaceBoardQuery(params);
    root.querySelector('#clear-filters')?.addEventListener('click', () => { form.reset(); form.elements.q.value = ''; update(); });
  };
  let timer;
  form.addEventListener('input', event => { clearTimeout(timer); if (event.target.name === 'q') timer = setTimeout(update, 180); else update(); });
  form.addEventListener('submit', event => event.preventDefault());
  update();
}
