<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Catalog maintenance

When maintaining or discovering catalog content, read the current repo prompt at
`.cursor/automations/daily-assets.md` and `data/automation-policy.json` first.
The owner requires at least 50 genuinely NEW verified items PER RUN combined
across permanent free, limited free and curated deals, with NO maximum item count.
Earlier runs today never satisfy this run's minimum. Record starting IDs across
free/active/archived items; report new identities against that baseline. Continue
beyond 50/100 while permitted inventory and the real time/download budget remain.
Five is an importer batch size, not a stopping point. After new promotions, use
`npm run catalog:grow -- --write` without --limit or --candidates. Pass actual
remaining --minutes, --minimum (subtract only this run's new promotions/imports)
and --downloaded-bytes when earlier work consumed those resources. Do not reset
budgets or run concurrent writers. Legacy --limit is now a minimum alias, never
an output cap; legacy --candidates no longer imposes an inspection ceiling.
Rechecks/candidate URLs are not additions. Report real shortfalls instead of
inventing data. Growth supports OpenGameArt alongside Kenney, Poly Haven textures
and ambientCG materials. OpenGameArt requires its own license/author/file fields,
real download inspection and CC-BY attribution when applicable. Its website
gallery preview rights are separate: only licensed download content is copied.
Respect the source's published crawl delay; do not bypass unsupported licenses.
Unity automation requires a separate source agreement under its
Asset Store Terms section 3.3; do not scrape it or its private APIs.
Curated Collections are also part of daily maintenance: review at least 3 existing
themes, update relevant selections and create at most 1 useful new theme per day.
Follow data/automation-policy.json collections limits and the full prompt. Keep
6–16 verified permanent-free members, stable IDs and member-owned covers. Advance
collection updatedAt only for real editorial changes; preserve asset verification
dates. Collection edits/memberships never count toward the 50-new-asset target.
Preserve source/licensing/preview/price/compatibility evidence. After all required
checks and build pass, commit catalog-only changes and push main directly as
authorized by the owner. No PR or owner review is required. Never force-push,
stage unrelated work, bypass source protection, or change account permissions.
