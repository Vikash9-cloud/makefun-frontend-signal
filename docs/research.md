# Research and compliance notes

Research date: 2026-11-17. Sources: the live make.fun public API, the competition leaderboard and the unpacked official kit. API values change; no figures here are app fixtures.

## API contract

- `GET /api/competitions?status=open&activity=times` returns `{items, next_cursor}`; pass `cursor` to retrieve subsequent pages. `activity=times` reduces activity payload. An `open` status alone does not guarantee entries are still accepted: compare `deadline` to the current time. Board fields include `slug`, `title`, `summary`, `category`, `status`, `deadline` (ISO 8601), `submissionCount` (number), `rewardAmount` (number), `potUsd` and `entryFeeUsd` (decimal USD strings or null), `rewardsNow` and `publishedAt`.
- `GET /api/competitions/{slug}` returns the same fields plus `description`, `rules`, `resolution`, `acceptingSubmissions`, `opensAt`, `escrowLock`, and `escrowLifecycle`. `rewardsNow[]` contains `place`, `baseUsd`, `feeShareUsd`, and `amountUsd`. Fields can be null or absent. `escrowLock.amount_usd` is the original lock, not necessarily the current pot.
- `GET /api/competitions/{slug}/leaderboard` returns `columns`, `entries`, `phase`, `rank_key`, and related metadata. `entries[]` expose `rank`, `handle`, `title`, `status`, `ranked`, `values`, and `display`; columns and their units differ by bounty. Results may be provisional, withheld, null, or tied. Paginate locally, since the observed response provides the complete entries array and no cursor.
- `GET /api/profiles/{handle}` returns public `handle`, `display_name`, `bio`, `joined_at`, `record`, and `solutions[]`; each solution can have `competition`, `placement`, `score`, and `prize_usd`. Do not display contact details or wallet data.
- API site URLs use `/bounty/{slug}` and `/u/{handle}`. Signal uses hash routes, which work on a plain static host without rewrite rules.
- Anonymous requests support CORS. The kit says ETags change each minute; conditional requests can return 304. Unauthenticated rate limits documented by skill v1.5.196 are 60/minute and 20,000/day per visitor, or 5,000/day without a visitor cookie; 429 provides `Retry-After`. Typical errors include `success: false` and an `error` array. The app uses no credentials or cookies.

## Competition research

The top public screenshots inspected on 17 November used persistent board/detail split panes, current pot/fee/countdown, reward tables and leaderboard context. This combination establishes strong feature coverage. At thumbnail size, some rows, labels, controls and numeric columns are small; a dark example compresses bounty titles heavily. Some screens reserve space for request telemetry rather than opportunity data. These are observations from two public image sheets, not a claim about every competitor. Source code and assets were not copied.

## Direction and budget

A dark ink surface with warm white text, a restrained cyan accent and amber urgency. Use a stable board rail plus a generous selected-bounty canvas on desktop; collapse to a single column on narrow screens. Show actual numbers, dates and public identities only. Aim for HTML <12 KB, CSS <12 KB, JS <20 KB uncompressed initially; use native modules, lazy views, memory caching, request deduplication, no external assets, and local pagination. Actual output is recorded in the dossier.

## Risk register and checklist

- Required Node >=22.18, Git, browser and Codex confirmed; Playwright MCP optional and unavailable, local Chrome automation used instead.
- Existing recording and paid fee were confirmed by the user; sealing, recording ID, session provenance, account quota and wallet ownership still need verification before submission.
- Submission deadline 2026-11-17 12:30 UTC; daily and total quota can be lower than nominal limits. Last accepted submission is final.
- Static `app/`, root `main.ts`, unchanged kit vendor, OSI license, three actual live-data screenshots, generated `dossier.json` and sealed recording IDs are required. Images must be <=256 KiB and <=1280 px long side.
- GitHub creation, remote, push, payment, signing, publishing and submission require the user's explicit approval. Repository-owner proof may be required if the account's GitHub login differs from the future repository owner.
- Third-party origins are prohibited by the user, including remote images. No sign-in, write requests or private data.
- Screenshot values and API status can go stale; capture close to handoff and describe them as a snapshot. Public data may change or vanish. Network errors and rate limiting must be recoverable.

## API consistency observation

At approximately 06:10 UTC on 17 November, the board endpoint reported the frontend bounty pot as $756.50 and 630 entries, while the detail endpoint reported $765.50 and 664 entries. Both returned 200 from live GET requests. This is an upstream snapshot discrepancy; no values were invented or overwritten. The detail is the closer view of a specific bounty, but neither response gives a guaranteed freshness timestamp.
