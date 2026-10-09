<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Catalog maintenance

When maintaining or discovering catalog content, read the current repo prompt at
`.cursor/automations/daily-assets.md` and `data/automation-policy.json` first.
The owner requires a daily target of at least 50 genuinely NEW verified items
combined across permanent free, limited free and curated deals. Five is a seed
batch size, not a stopping point. After verifying new promotions, use
`npm run catalog:grow -- --limit=50 --write` to fill today's shortfall from the
unlisted backlog; subtract already used inspection/time budgets with its flags.
Rechecks/candidate URLs are not additions. Report real shortfalls instead of
inventing data. Unity automation requires a separate source agreement under its
Asset Store Terms section 3.3; do not scrape it or its private APIs.
Preserve source/licensing/preview/price/compatibility evidence. After all required
checks and build pass, commit catalog-only changes and push main directly as
authorized by the owner. No PR or owner review is required. Never force-push,
stage unrelated work, bypass source protection, or change account permissions.
