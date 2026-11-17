# Signal

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Vikash9-cloud/makefun-frontend-signal/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Vikash9-cloud/makefun-frontend-signal/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Signal is a read-only market desk for live make.fun competitions. Browse rewards and deadlines, inspect bounty rules, compare standings, and explore public profiles.

## Run

Serve `app/` with any static server, for example `python -m http.server 8080 --directory app`, then open http://localhost:8080. Hash routes can be refreshed on a plain static server. No build or credentials are needed.

For the competition artifact, run `MAKEFUN_OUTPUT_DIR=out node main.ts` on Node 22.18 or later (PowerShell: `$env:MAKEFUN_OUTPUT_DIR='out'; node main.ts`). This copies the static app and screenshots and uses the unchanged kit helper to produce `dossier.json`.

## Architecture

Native modules fetch only public GET endpoints at make.fun. `api.js` keeps a one-minute in-memory cache and revalidates with ETags when exposed; `format.js` formats values and derives availability from deadlines. `main.js` renders the board, detail, leaderboard and public profile. Board filters are shareable in the hash URL. The leaderboard initially renders 30 rows and offers more. No framework, external fonts, analytics, or third-party runtime assets are used.

Semantic navigation, labels, keyboard focus and responsive layouts support keyboard and mobile use. Data and metrics are as reported by the public API; no account access or transactions are provided.

## License

MIT. The unchanged competition helper is supplied by make.fun's kit.
