# Make.fun Frontend — Dossier

## What this app does

Signal is an independent, read-only static interface for finding make.fun opportunities and examining their public results. It reads the live public API, never signs in or sends a write request.

## Four required surfaces

- Board: reported pots, entry fees, deadlines, status and entry counts; search, status and fee filters, sorting and shareable filter URLs.
- Bounty: summary and description, grouped payout table, dates, funding information when published, and a leaderboard preview.
- Leaderboard: public ranks, identities and API-defined metrics, with local pages of 20.
- Profile: public handle, aggregate record and entries, ordered by best published placement; no contact or wallet data.

Each has a hash URL and is reachable through the interface on a simple static host. Status accounts for passed deadlines even if the API still says open.

## Live API usage

GET `/api/competitions?status=open&activity=times`, `/api/competitions/{slug}`, `/api/competitions/{slug}/leaderboard`, and `/api/profiles/{handle}`. The board follows `next_cursor` when supplied. Data is displayed as reported; the board and detail endpoints can update on different schedules. During testing their reported pot for the same bounty differed, so the current value should be checked on the detail page.

## Performance

- Official dossier measurement: seven first-load source files, **10,800 bytes gzip-9 / 33,203 bytes raw**; three lazy modules add 4,075 bytes gzip-9. These are file sizes, not a measurement of total network transfer including API data, headers or favicon. The CSS is 15,291 bytes raw, above the preferred 12 KB target.
- Chrome locally observed an initial board render in 296–601 ms in several unthrottled runs; this is not a device or network guarantee. One separate observation transferred about 36 KB encoded for the API response; response sizes and caching vary.
- In-memory cache TTL 30 seconds, in-flight deduplication and conditional ETag revalidation; search debounce 180 ms. Long leaderboard arrays are rendered 20 rows at a time.
- Native modules, no framework, no build step, no remote assets or third-party code.

## Design decisions

A high-contrast dark surface gives the live pot, time and entry fee prominence. The board uses an in-focus panel to make the nearest deadline easy to inspect. Equal adjacent reward amounts are grouped without changing their values. Judge win-rate millionths are displayed as percentages. Profile entries are sorted by published placement.

## Accessibility

Semantic navigation and main landmarks, a skip link, named controls, visible keyboard focus, status text, responsive layout and reduced-motion support. An axe-core WCAG A/AA automated scan on the four desktop views reported zero violations after fixing a brand-label mismatch. Automated results do not replace a full manual accessibility audit.

## Testing

Chrome on Windows: live board, search and URL reload, filters and sorting, empty state, bounty detail and rewards, leaderboard and pagination, public profile and reload, invalid routes, simulated 429 and retry affordance, browser back and memory cache, 360px overflow on all four routes, keyboard tab progression, shared-search reset and 429 retry recovery. No application errors, cross-origin requests other than make.fun, or write requests were observed in the test. All 12 board-item detail endpoints returned HTTP 200 at the time of the check. Node 22.18.0 and Node 26.13.0 both ran `main.ts`; the vendored library hash matches the kit. Screenshot files satisfy the kit's byte and dimension limits. Anti-slop static check passed on an HTML/CSS composite after deterministic fixes; dynamic markup was not analyzed by that check.

## File map

`app/index.html` and `app/assets/css/main.css` define the shell and visual system. `app/assets/js/main.js`, `api.js`, `router.js` and `format.js` provide bootstrapping, GET requests, routing and formatting. `views/` contains the four surfaces. `main.ts` and `vendor/makefun-frontend.ts` produce the grader output. `docs/research.md` records the API and competition research.

## How to run

Serve `app/` as the document root, for example `python -m http.server 8080 --directory app`, and open localhost:8080. For grader output, set `MAKEFUN_OUTPUT_DIR` and run `node main.ts` on Node 22.18 or newer. No frontend build is needed.

## License

MIT; see `LICENSE`.

## Screenshots

Three unedited 1280×800 PNG browser captures of the running app with public API data: `01-board-cover.png` (board), `02-bounty-detail-leaderboard.png` (payouts and standings), and `03-profile-performance.png` (a public profile). Values are snapshots and change over time.



The kit's `check --worktree` was attempted locally. It verified the kit and the competition window but could not snapshot the repository: the Git child process failed with Windows `NtCreateDirectoryObject` access denied (`0xC0000022`), so license and entrypoint checks were skipped. It must be rerun on the eventual commit in an environment where Git can run normally. The site alone checks the sealed recording, repository ownership, freshness and submitted commit. No submission has been made.
