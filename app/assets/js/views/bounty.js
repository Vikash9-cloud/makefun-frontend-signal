import { esc, number, money, fee, date, timeLeft, state, urgent, bountyPath, profilePath, prose } from '../format.js';

export function metrics(b) {
  return `<div class="metric-grid"><div><span>Live prize pot</span><strong class="accent">${money(b.potUsd ?? b.rewardAmount)}</strong><small>${money(b.rewardAmount)} base reward</small></div><div><span>Entry fee</span><strong>${fee(b.entryFeeUsd)}</strong><small>${number(b.entryFeePayers)} fee payers</small></div><div><span>Time remaining</span><strong class="${urgent(b) ? 'urgent' : ''}" data-deadline="${esc(b.deadline)}">${timeLeft(b.deadline)}</strong><small>${date(b.deadline)}</small></div><div><span>Entries</span><strong>${number(b.submissionCount)}</strong><small>${esc(state(b))}</small></div></div>`;
}
export function rewards(b) {
  const rows = b.rewardsNow || [];
  if (!rows.length) return '<p class="muted">Reward breakdown not published.</p>';
  const groups = [];
  for (const row of rows) {
    const last = groups.at(-1);
    if (last && Number(row.place) === Number(last.end) + 1 && row.baseUsd === last.baseUsd && row.feeShareUsd === last.feeShareUsd && row.amountUsd === last.amountUsd) last.end = row.place;
    else groups.push({ ...row, end:row.place });
  }
  return `<div class="reward-table"><div class="reward-head"><span>Place</span><span>Base</span><span>Fee share</span><span>Prize now</span></div>${groups.map(r => `<div><span>#${number(r.place)}${r.end !== r.place ? `–${number(r.end)}` : ''}</span><span>${money(r.baseUsd)}</span><span>${money(r.feeShareUsd)}</span><strong>${money(r.amountUsd)}${r.end !== r.place ? ' each' : ''}</strong></div>`).join('')}</div>`;
}
export function score(entry, column) {
  const value = entry.values?.[column?.key];
  if (column?.source === 'performance.judge.win_rate_micro' && value != null && Number.isFinite(Number(value))) return (Number(value) / 10000).toFixed(1) + '%';
  return column ? (entry.display?.[column.key] ?? value ?? '—') : '—';
}
export function leaderboardRows(data, limit = 5) {
  const entries = (data.entries || []).slice(0, limit);
  const column = (data.columns || []).find(c => c.key === data.rank_key) || (data.columns || []).find(c => !c.hidden);
  return entries.length ? `<div class="rank-list">${entries.map(e => `<div class="rank-row"><span class="rank-no">${e.rank == null ? '—' : number(e.rank)}</span><div><strong>${e.handle ? `<a href="${profilePath(e.handle)}">${esc(e.handle)}</a>` : 'Identity withheld'}</strong><small>${esc(e.title || e.status || 'Entry')}</small></div><div class="rank-score"><strong>${esc(score(e, column))}</strong><small>${esc(column?.title || 'Score')}</small></div></div>`).join('')}</div>` : '<p class="muted">No public leaderboard entries yet.</p>';
}
export function renderBounty(root, b, leaderboard) {
  root.innerHTML = `<div class="page detail-page"><div class="breadcrumb"><a href="#/">Bounty board</a><span>/</span><span>${esc(b.category || 'Bounty')}</span></div><div class="detail-title"><div><div class="detail-tags"><span class="status ${urgent(b) ? 'warning' : ''}">${state(b)}</span><span>${esc(b.slug)}</span></div><h1>${esc(b.title)}</h1><p>${esc(b.summary || '')}</p></div><a class="button secondary" href="https://make.fun/bounty/${encodeURIComponent(b.slug)}" target="_blank" rel="noopener noreferrer">View on make.fun ↗</a></div>${metrics(b)}<div class="detail-columns"><div class="detail-main"><section class="surface"><div class="section-head"><div><span class="section-label">THE PAYOUT</span><h2>Rewards at the live pot</h2></div><span>${number((b.rewardsNow || []).length)} places</span></div>${rewards(b)}</section><section class="surface description"><div class="section-head"><div><span class="section-label">THE BRIEF</span><h2>Description &amp; rules</h2></div></div>${prose(b.description || b.rules || b.summary)}</section></div><aside class="detail-side"><section class="surface"><div class="section-head"><div><span class="section-label">LIVE STANDINGS</span><h2>Leaderboard</h2></div><a href="${bountyPath(b.slug)}/leaderboard">View all ↗</a></div>${leaderboard ? leaderboardRows(leaderboard) : '<p class="muted">Leaderboard could not be loaded. Open it to retry.</p>'}</section><section class="surface facts"><h2>Bounty details</h2><dl><div><dt>Opened</dt><dd>${date(b.opensAt || b.publishedAt)}</dd></div><div><dt>Deadline</dt><dd>${date(b.deadline)}</dd></div><div><dt>Status</dt><dd>${esc(state(b))}</dd></div><div><dt>Reward funding</dt><dd>${b.escrowLock ? `Escrowed ${money(b.escrowLock.amount_usd)}${b.escrowLock.cluster ? ` · ${esc(b.escrowLock.cluster)}` : ''}` : b.walletPaid ? 'Reward wallet' : 'Not published'}</dd></div></dl></section></aside></div></div>`;
}
