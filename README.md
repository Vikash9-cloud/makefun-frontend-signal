# Signal

[![make.fun competition](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01)
[![Competition rank](https://make.fun/badge/makefun-frontend-01/Vikash9-cloud/makefun-frontend-signal/rank.svg)](https://make.fun/bounty/makefun-frontend-01)
[![Competition reward](https://make.fun/badge/makefun-frontend-01/Vikash9-cloud/makefun-frontend-signal/reward.svg)](https://make.fun/bounty/makefun-frontend-01)

Signal is a small, read-only explorer for make.fun competitions. Browse open challenges, inspect their live prize breakdowns, explore standings and visit public builder profiles. Data comes from the public make.fun GET API; the app does not sign in or submit entries.

Serve `app/` with any static HTTP server, for example `python -m http.server 4173 --directory app`, then open `http://localhost:4173`. Hash routes work on static hosting. The interface caches API responses for one minute and revalidates with ETags when available.

Run `node main.ts` with Node 22.18 or later to assemble `/output`. For a local build, set `MAKEFUN_OUTPUT_DIR` to a project-local directory. The program copies the app and three captured screenshots and builds the dossier with the official kit helper. It does not access the network.

The screenshots show the board, a competition overview, and its leaderboard at 1280 × 800. Live data changes over time.
