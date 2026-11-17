# Signal for make.fun

[![make.fun competition](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01)
[![make.fun rank](https://make.fun/badge/makefun-frontend-01/Vikash9-cloud/makefun-frontend-signal/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard)
[![make.fun reward](https://make.fun/badge/makefun-frontend-01/Vikash9-cloud/makefun-frontend-signal/reward.svg)](https://make.fun/bounty/makefun-frontend-01)

Signal is an independent, read-only static client for the public make.fun API. It brings together open bounties, live pots, deadlines, payout breakdowns, leaderboards and public profiles. No account or API key is needed.

## Run

Use any static server with `app/` as its document root. For example, from this repository:

```sh
python -m http.server 8080 --directory app
```

Open `http://localhost:8080/`. The app uses hash routes, so a link such as `/#/bounty/makefun-frontend-01` works on a static server without rewrite rules. `/#/bounty/<slug>/leaderboard` and `/#/account/<handle>` are also directly loadable. Board search and filters are encoded in its URL.

To produce the competition output, use Node.js 22.18 or newer. On PowerShell:

```powershell
$env:MAKEFUN_OUTPUT_DIR = Join-Path (Get-Location) 'out'
node main.ts
```

`main.ts` copies `app/` and the three screenshots to that directory and creates the official `dossier.json` using the unchanged kit library in `vendor/`. Without `MAKEFUN_OUTPUT_DIR` it writes to `/output`, as the grader expects.

## Architecture

Native ES modules and CSS run directly in the browser; there is no app build or framework runtime. `api.js` calls only GET endpoints under `https://make.fun/api`, omits credentials, deduplicates in-flight requests and caches answers in memory for 30 seconds. When a cached answer expires or the user refreshes, it sends an available ETag for revalidation. Detail, leaderboard and profile modules load on demand. Leaderboards are paginated in the browser, while board cursor pages are fetched when present.

A bounty's API status can remain open after its deadline. Signal checks both status and deadline for entry availability; a missing deadline is identified as unavailable. Pots, entries and rankings are the API's reported snapshots, not independent verification. The board and detail endpoints can update at different times. Errors, 429 responses, empty results and missing pages have recovery or navigation paths.

The interface uses semantic landmarks, labeled controls, keyboard focus outlines, responsive layouts and reduced-motion support. No remote fonts, images, scripts or analytics are used. Public profile views deliberately omit contact and wallet information.

See [docs/research.md](docs/research.md) for the API contract, constraints and risk register and [docs/dossier.md](docs/dossier.md) for measured output and testing. Licensed under MIT; see [LICENSE](LICENSE).
