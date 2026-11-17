import { esc, number, money, date, bountyPath } from '../format.js';

export function profileSearch() {
  return `<section class="profile-search surface"><h2>Find a public profile</h2><p>Enter a make.fun handle to see public participation.</p><form id="profile-form"><label for="handle">Account handle</label><div><input id="handle" name="handle" required maxlength="100" placeholder="e.g. superskie" autocomplete="off"><button class="button primary">Find profile</button></div></form></section>`;
}
export function bindProfileSearch(root) {
  root.querySelector('#profile-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const handle = new FormData(event.currentTarget).get('handle').trim();
    if (handle) location.hash = `#/account/${encodeURIComponent(handle)}`;
  });
}
export function renderProfile(root, p) {
  const r = p.record || {}, solutions = [...(p.solutions || [])].sort((a,b) => (a.placement ?? Infinity) - (b.placement ?? Infinity));
  root.innerHTML = `<div class="page profile-page"><div class="breadcrumb"><a href="#/">Bounty board</a><span>/</span><span>Public profile</span></div><div class="profile-heading"><div class="avatar" aria-hidden="true">${esc((p.handle || '?').charAt(0).toUpperCase())}</div><div><span class="section-label">PUBLIC PROFILE</span><h1>@${esc(p.handle)}</h1><p>Public account${p.joined_at ? ` · Joined ${date(p.joined_at).split(',')[0]}` : ''}</p></div></div><div class="leader-summary profile-metrics"><div><strong>${number(r.competitions_entered)}</strong><span>bounties entered</span></div><div><strong>${number(r.competitions_placed)}</strong><span>places earned</span></div><div><strong>${number(r.podium_finishes)}</strong><span>podium finishes</span></div><div><strong>${money(r.prize_usd)}</strong><span>prizes recorded</span></div></div><div class="profile-columns"><section class="surface participation"><div class="section-head"><div><span class="section-label">TRACK RECORD</span><h2>Public participation</h2></div><span>${number(solutions.length)} entries · best placements first</span></div>${solutions.length ? solutions.map(s => `<article class="solution"><div><a href="${bountyPath(s.competition?.slug || '')}">${esc(s.competition?.title || 'Bounty')}</a><strong>${esc(s.title || 'Untitled entry')}</strong><small>${date(s.entered_at)}</small></div><div><strong>${s.placement != null ? `#${number(s.placement)}` : '—'}</strong><small>${s.prize_usd != null ? money(s.prize_usd) : 'No prize shown'}</small></div></article>`).join('') : '<p class="muted">No public entries are available.</p>'}</section><aside>${profileSearch()}<div class="aside-note"><span class="note-symbol">✳</span><div><strong>Public by design.</strong><p>Only profile and participation data published by make.fun is shown here.</p></div></div></aside></div></div>`;
  bindProfileSearch(root);
}
