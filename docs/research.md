# Research notes

## API contract

- `GET /api/competitions?status=open` returns `items` and nullable `next_cursor`. Items include `slug`, `title`, numeric `rewardAmount`, decimal-string `potUsd` and nullable `entryFeeUsd`, ISO `deadline`, `submissionCount`, `category`, and `status`. A deadline in the past closes entries even if status remains open.
- `GET /api/competitions/{slug}` returns the same core fields plus `description`, `rules`, `summary`, `rewards`, `rewardsNow` (place and decimal-string amount), and nullable `escrowLock`.
- `GET /api/competitions/{slug}/leaderboard` returns `columns`, `rank_key`, `phase`, and `entries` including nullable `rank`, public `handle`, `title`, `status`, `values`, and `display` keyed by metric. Large lists are rendered in batches.
- `GET /api/profiles/{handle}` returns public `handle`, `joined_at`, `record`, and `solutions` with competition and score metadata. Missing accounts return an error.
- API CORS supports static clients. Official rules describe minute-bound ETags. Anonymous limits are 60 requests per minute; 429 may include Retry-After. Errors have a `success: false` and `error` array. Browser addresses are `#/`, `#/bounty/{slug}`, `#/bounty/{slug}/leaderboard`, and `#/account/{handle}`; make.fun's canonical public pages use `/bounty/{slug}` and `/u/{handle}`.

## Competitive direction

The live leaderboard exposes highly ranked entries emphasizing side-by-side boards and small first loads. Signal emphasizes immediate pot, deadline and fee comparisons with readable rows, then uses the same visual language for rewards and public standings. Competitor source and images were not copied. Screenshot-level competitor review was not completed.

## Budget and risks

Target under 12 KB HTML, 12 KB CSS and 20 KB JavaScript raw. Live data can change between captures and API responses can be temporarily stale. Rankings and profiles are public data only. Rendering batch sizes limit DOM growth, though the leaderboard response itself is fetched in full. The rules text is rendered as escaped readable paragraphs rather than a complete Markdown implementation.
