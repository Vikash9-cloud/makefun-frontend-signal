# Make.fun Frontend — Dossier

## What this app does
Signal is a read-only opportunity desk for the make.fun public API.

## Four required surfaces
Board with search, sorting and status filters; bounty detail and reward ladder; leaderboard with incremental rendering; public profile and competition history. Each uses a shareable hash route.

## Live API usage
GET competitions, competition details, leaderboards and profiles from https://make.fun/api. Availability accounts for past deadlines. Amounts and ranks come from API responses.

## Performance
The kit dossier reports 5 first-load files, 24,196 raw bytes and 8,389 gzip-9 bytes. On one local Chrome run the board was ready in 534 ms, including a live API request; this is not a controlled benchmark. A one-minute in-memory cache avoids duplicate requests, with ETag revalidation when the header is available. Search is debounced. No external runtime assets, frameworks or fonts.

## Design decisions
A prominent aggregate pot leads into a compact opportunity list. Fees, time remaining and entries sit beside each reward. Closed deadlines are distinguished from accepting entries.

## Accessibility
Semantic navigation and main landmark, labeled controls, visible focus, responsive layouts, and a skip link. No meaningful images require alt text.

## Testing
Chrome at 1280×800: three live-data captures; board search, detail, leaderboard, load more, public profile and invalid route exercised; no page errors or unexpected request origins observed. At 360px no horizontal overflow was detected on the board. The kit helper generated the dossier and vendor SHA-256 matched the kit. Anti-slop reported no issues in index.html; stylesheet-dependent checks were partial because CSS is linked.

## File map
`app/` contains static HTML, CSS, and native JavaScript modules; `main.ts` packages the app and screenshots; `vendor/` contains the unchanged kit helper.

## How to run
Serve `app/` with a static HTTP server. Set `MAKEFUN_OUTPUT_DIR` and run `node main.ts` to create the competition output.

## License
MIT.

## Screenshots
Board cover, bounty detail with leading entries and rewards, and a public profile. All are unedited 1280×800 browser captures using live data.
