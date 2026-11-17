import { getBoard, getBounty, getLeaderboard, getProfile } from './api.js';
import { route } from './router.js';
import { esc, timeLeft, taking, bountyPath } from './format.js';
import { renderBoard } from './views/board.js';

const root = document.querySelector('#main');
let currentSlug = '', currentHandle = '', sequence = 0;
function navigation(active) {
  const detail = currentSlug ? bountyPath(currentSlug) : '#/';
  document.querySelector('#navigation').innerHTML = `<a href="#/" ${active === 'board' ? 'aria-current="page"' : ''}>Board</a><a href="${detail}" ${active === 'bounty' ? 'aria-current="page"' : ''}>Bounty</a><a href="${currentSlug ? `${detail}/leaderboard` : '#/'}" ${active === 'leaderboard' ? 'aria-current="page"' : ''}>Leaderboard</a><a href="${currentHandle ? `#/account/${encodeURIComponent(currentHandle)}` : '#/account'}" ${(active === 'profile' || active === 'profile-search') ? 'aria-current="page"' : ''}>Profile</a>`;
}
function loading() {
  root.innerHTML = '<div class="page loading-shell" role="status" aria-label="Loading live data"><div></div><div></div><div></div></div>';
}
function failure(error) {
  const hint = error.status === 404 ? 'This bounty or public profile could not be found.' : error.status === 429 ? `The public API is busy.${error.retryAfter ? ` Try again in ${esc(error.retryAfter)} seconds.` : ' Try again shortly.'}` : 'Check your connection and try again.';
  root.innerHTML = `<div class="page"><div class="error-state"><span class="section-label">UNABLE TO LOAD</span><h1>Data is unavailable</h1><p>${hint}</p><button class="button primary" id="retry">Try again</button> <a href="#/">Return to board</a></div></div>`;
  root.querySelector('#retry').onclick = () => render(true);
}
async function render(force = false) {
  const id = ++sequence, current = route();
  window.__shotReady = false;
  if (current.slug) currentSlug = current.slug;
  if (current.handle) currentHandle = current.handle;
  navigation(current.name);
  loading();
  try {
    if (current.name === 'board') {
      const items = await getBoard(force);
      if (id !== sequence) return;
      currentSlug ||= [...items.filter(taking)].sort((a,b) => Date.parse(a.deadline) - Date.parse(b.deadline))[0]?.slug || '';
      navigation(current.name);
      renderBoard(root, items, current.query);
    } else if (current.name === 'bounty') {
      const [b, leaderboard, view] = await Promise.all([getBounty(current.slug, force), getLeaderboard(current.slug, force).catch(() => null), import('./views/bounty.js')]);
      if (id !== sequence) return;
      view.renderBounty(root, b, leaderboard);
    } else if (current.name === 'leaderboard') {
      const [b, data, view] = await Promise.all([getBounty(current.slug, force), getLeaderboard(current.slug, force), import('./views/leaderboard.js')]);
      if (id !== sequence) return;
      view.renderLeaderboard(root, b, data);
    } else if (current.name === 'profile') {
      const [p, view] = await Promise.all([getProfile(current.handle, force), import('./views/profile.js')]);
      if (id !== sequence) return;
      view.renderProfile(root, p);
    } else if (current.name === 'profile-search') {
      const view = await import('./views/profile.js');
      if (id !== sequence) return;
      root.innerHTML = `<div class="page narrow"><div class="breadcrumb"><a href="#/">Bounty board</a><span>/</span><span>Profiles</span></div>${view.profileSearch()}</div>`;
      view.bindProfileSearch(root);
    } else {
      root.innerHTML = '<div class="page"><div class="error-state"><h1>Page not found</h1><p>Use the board to find a bounty or public profile.</p><a class="button primary" href="#/">Go to board</a></div></div>';
    }
    document.querySelector('#updated').textContent = '· just updated';
    window.__shotReady = true;
  } catch (error) {
    if (id !== sequence) return;
    failure(error);
    window.__shotReady = true;
  }
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
document.querySelector('#refresh').addEventListener('click', () => render(true));
setInterval(() => document.querySelectorAll('[data-deadline]').forEach(el => { el.textContent = timeLeft(el.dataset.deadline); }), 30000);
render();
