import { esc, number, bountyPath } from '../format.js';
import { leaderboardRows } from './bounty.js';

export function renderLeaderboard(root, bounty, data) {
  const entries = data.entries || [], column = (data.columns || []).find(c => c.key === data.rank_key);
  let page = 0;
  root.innerHTML = `<div class="page leaderboard-page"><div class="breadcrumb"><a href="#/">Bounty board</a><span>/</span><a href="${bountyPath(bounty.slug)}">${esc(bounty.title)}</a><span>/</span><span>Leaderboard</span></div><div class="leader-heading"><div><span class="section-label">LIVE STANDINGS</span><h1>Leaderboard</h1><p>${esc(bounty.title)}</p></div><a class="button secondary" href="${bountyPath(bounty.slug)}">Bounty details</a></div><div class="leader-summary"><div><strong>${number(entries.length)}</strong><span>public entries</span></div><div><strong>${esc(data.phase?.title || 'Current')}</strong><span>competition phase</span></div><div><strong>${esc(column?.title || data.rank_key || 'Rank')}</strong><span>ranking metric</span></div></div><section class="surface leader-table"><div class="section-head"><div><h2>Ranked entries</h2><p>${esc(bounty.resolution?.metric?.name || column?.title || 'Results')}${bounty.resolution?.metric?.unit ? ` · ${esc(column?.source === 'performance.judge.win_rate_micro' ? 'percent' : bounty.resolution.metric.unit)}` : ''}${bounty.resolution?.metric?.better ? ` · ${esc(bounty.resolution.metric.better)} is better` : ''}</p></div><span>${data.phase?.scores === 'live' ? 'Live results' : esc(data.phase?.title || '')}</span></div><div id="leader-rows"></div><div class="pagination"><button type="button" id="previous">Previous</button><span id="page-label"></span><button type="button" id="next">Next</button></div></section></div>`;
  const draw = () => {
    const start = page * 20;
    root.querySelector('#leader-rows').innerHTML = leaderboardRows({ ...data, entries:entries.slice(start, start + 20) }, 20);
    root.querySelector('#page-label').textContent = entries.length ? `${start + 1}–${Math.min(start + 20, entries.length)} of ${number(entries.length)}` : 'No entries';
    root.querySelector('#previous').disabled = page === 0;
    root.querySelector('#next').disabled = start + 20 >= entries.length;
  };
  root.querySelector('#previous').onclick = () => { page--; draw(); };
  root.querySelector('#next').onclick = () => { page++; draw(); };
  draw();
}
