# Static deployment efficiency

Measured on 10 October 2026 against production commit
`1fbba59f7a9bb9790a91c26bb076d80a875cd311`, with the same 1,576 free assets,
16 promotions, 14 curated collections and all existing media. Sizes below are
decimal MB of the local static export, not Vercel's billed storage meter.

| Measurement | Before | After |
| --- | ---: | ---: |
| Complete static export | 1,417.12 MB | 220.79 MB |
| Exported files | 20,939 | 9,805 |
| Canonical asset pages | 1,592 | 1,592 |
| Preview images | 60.78 MB | 60.78 MB |
| `/free/` initial HTML | 3.96 MB | 0.106 MB |
| Tiny Town detail HTML | 0.142 MB | 0.055 MB |

The export is **84.42% smaller**. No catalog records, image previews, audio
samples, verification dates, licenses, prices or scores were changed.

## What changed

- Only `/asset/[slug]/` and `/category/[slug]/` are exported. Existing permanent
  Vercel redirects preserve older `/assets/` and `/categories/` links without
  storing a second copy of every page. The local static server does not simulate
  these platform redirects.
- Each gallery prerenders 12 cards plus filter choices and the total count.
  One content-addressed JSON index supplies the complete catalog for search,
  filters, favorites, personal collections and additional cards. It is shared
  across client navigation, cached for a year and regenerated when data changes.
  Licensed download provenance remains in the source catalog and detail pages;
  it is not copied into every gallery.
- Favorite/collection identity validation reads the ID list from shared client
  code. The entire list is no longer serialized repeatedly into every page.
- UI icons use the same Phosphor shapes through one content-addressed SVG sprite,
  including all supported weights and the original MIT license.
- Asset detail views and the footer share client component code while retaining
  their complete prerendered HTML. Licenses, attribution, source links,
  compatibility evidence, metadata and structured data remain available to
  crawlers without JavaScript. Next's required navigation payloads are preserved.
- Directory structured data describes the initial 12 cards and retains the full
  catalog count. The sitemap still includes every canonical asset page.

The current shared card index is 1.81 MB before HTTP compression, and the shared
icon sprite is 0.108 MB. Index loading has a timeout and retry control; the initial
preview cards remain usable if the request fails.

## Daily maintenance

Use the existing daily workflow. There is no new catalog quota: the owner's
minimum of 50 genuinely new verified assets **per run**, with no item maximum,
is unchanged. Existing source permissions, evidence checks, real execution and
download budgets still apply.

`npm run dev`, `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`
automatically prepare the generated discovery files. Do not commit
`lib/generated/`, `public/_catalog/`, `public/_ui/`, `.next/` or `out/`. A clean
Vercel installation generates these files as part of the build. Keep build/prep
writers sequential.

Every build runs catalog validation, static SEO checks and an export-size guard.
`npm run storage:check` can repeat the size check on an existing build. Its report
is written to `.cache/export-size.json`. The guard rejects duplicate legacy
route exports, catalog-wide ID arrays embedded in HTML/navigation data, and
asset exports averaging more than 180 KB per canonical page. This is a code
regression guard, not a limit on importing assets.

At the current averages, one additional asset adds approximately 94 KB of
HTML/navigation files, 39 KB of preview media and a small index/sitemap entry:
roughly **0.13–0.17 MB per asset**, or **7–9 MB per 50 assets**. This is an estimate
from this catalog, not a measured daily run; longer evidence or larger media can
change it. Each deployment still contains the complete current static export.

## Verification and operational limits

Lint, TypeScript/build, all 82 tests and the static SEO/export checks passed.
Browser checks covered desktop and 390px mobile layouts, shared URL filters,
search beyond the initial 12 cards, loading more cards, favorite persistence,
personal collections, individual license evidence and index failure/retry.

This change does not alter Vercel deployment retention or delete prior releases.
Older deployments can continue contributing to account usage until Vercel's
existing retention policy removes them. Vercel's actual storage meter depends
on retained deployments, deployment growth and other projects; this local export
measurement does not guarantee that an indefinitely growing account stays below
10 GB. See [Vercel deployment storage](https://vercel.com/docs/deployment-storage)
and [deployment retention](https://vercel.com/docs/deployment-retention).
