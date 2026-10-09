# AssetRadar

A compact creative workspace for discovering genuine free game-development assets, temporarily free premium packs and worthwhile deals. Built with Next.js, TypeScript, Tailwind CSS, and verified static JSON catalogs.

[Visit AssetRadar](https://gameassetradar.top/)

## Run locally

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Production preview:

```sh
npm run build
npm start
```

The exported site is in `out/`; the local static preview listens on port 3001. Vercel serves these files directly. There is no database, login, runtime API, or paid backend.

## The library

- Search plus combined genre, dimension, asset type, engine, license, and source filters. Filters are shareable in the URL.
- Latest additions, CC0 browsing, grid/list views, and responsive navigation.
- Favorites and personal collections saved in this browser with `localStorage`, including cross-tab updates and graceful handling of unavailable storage.
- Twelve curated collections and static pages for every asset and category.
- Original animated editorial scenes, a radar navigation panel, and optional motion. Animations pause offscreen or in hidden tabs and respect reduced-motion preferences.
- Free Today with verified zero prices, license tiers and known-expiry countdowns; Deals Radar with real prices, discounts and marketplace ratings when available.
- Transparent Radar Score, commercial-use notes, and automatic expiry/stale-evidence protection. The homepage keeps free assets at its core while highlighting a few reviewed promotions.
- Canonical URLs, metadata, social previews, structured data, sitemap, and robots rules.
- Original audio samples load only when played; licensed free previews are local optimized WebP files. Promotions prefer real publisher-hosted screenshots with creator credit and a fallback; audio without useful art keeps an original animated cover. Publisher marketing art and premium packs are not rehosted.

The library contains **82 CC0 assets: 79 from Kenney and 3 texture materials from Poly Haven**. The 58 additional Kenney packs were verified on 9 October 2026 in Asia/Jakarta. Together with 3 limited-free offers and 6 deals, the directory grew from 29 to 91 entries. [Provenance and licensing](docs/catalog-provenance.md) explains the evidence and preview permissions. Catalog metadata is in `data/assets.json`; evidence is in `data/evidence/`. Publisher-listed file counts are preserved where available. “Latest” means added to AssetRadar, not the asset's original release date. Genre placement is editorial. Engine filters describe supported file formats; engine setup may be required.

## Catalog maintenance

```sh
npm run catalog:validate          # Schema, dates, deduplication, media, and evidence
npm run catalog:check             # Read-only live source/license/download checks
npm run catalog:discover -- --limit=150 # Candidates only; no catalog mutation
npm run catalog:check -- --limit=20 --write
```

Requests use the explicit allowlist in `scripts/source-policy.ts`, source robots rules where applicable, an identifying User-Agent, and pacing. Discovery and check reports are written to the ignored `.cache/` directory. An unavailable or ambiguous source fails verification; no failed check is stamped as current.

Approved Kenney candidates can be imported with a reviewed descriptor file:

```sh
npx tsx scripts/seed-catalog.ts --input=.cache/kenney-imports.json
npx tsx scripts/seed-polyhaven.ts --input=.cache/polyhaven-imports.json
```

Importers retain existing entries and verification dates, verify new source evidence, and generate previews from permitted asset files. They never overwrite the catalog with an initial seed. Each import batch stays at five descriptors. The prepared daily workflow can add **up to 50 genuinely verified new items per day** across all catalog types, inspect 150 candidates, and recheck 50 promotions plus 20 old free entries, subject to time/download/source limits. This is a project ceiling, not a Cursor guarantee. Start with [the Indonesian Cursor guide](docs/cursor-daily-guide.md), [the ready-to-paste prompt](.cursor/automations/daily-assets.md), and [technical automation details](docs/automation.md).

Promotion data lives in `data/offers.json` with matching first-party price/license evidence in `data/offer-evidence/`. The initial 3 limited-free Fab packs and 2 itch.io deals were checked on 8 October 2026 at 16:41 UTC; four additional itch.io deals were checked at 21:25–21:26 UTC (9 October in Jakarta). Prices retain the actually displayed currency and license tier; there are no invented USD conversions or end dates. These records naturally become inactive without a new check within 48 hours.

```sh
npm run offers:validate          # Read-only integrity, evidence and expiry review
npm run offers:check-links       # Reachability report; never refreshes price verification
npm run offers:update            # Import reviewed candidates and archive expired/stale entries
```

Reviewed candidates go in `data/offer-candidates.json`; archived records remain in `data/offer-archive.json`. The updater calculates discounts and the six-part Radar Score, rejects duplicate canonical/affiliate identities and mismatched evidence, and takes lastChecked only from a completed verification. A working link alone cannot verify a deal. Publication requires source price, currency, tier, applicable commercial license and actual ratings where available. No explicit art permission means no copied product thumbnail.

[Radar Score v2](docs/radar-score.md) uses conservative rating-sample weighting, anchored editorial grades and provisional scores for unrated free packs. Each detail page shows the breakdown. Visitor text is English and prices display USD. Original source currencies remain in verification data; non-USD displays are explicitly marked estimates using dated ECB reference rates. Run `npm run prices:refresh` to update the static reference snapshot, without changing product price evidence or lastChecked. Unsupported or outdated conversion estimates are hidden.

Canonical SEO routes are `/free/`, `/free-today/`, `/deals/`, `/collections/`, `/category/[slug]/` and `/asset/[slug]/`. Legacy plural asset/category paths permanently redirect on Vercel. Private Favorites stay noindex, and collections/favorites work locally without accounts. Promotion prices/claims wait for a live browser clock so cached HTML cannot advertise an expired price; permanent-free content remains available in static HTML.

## Checks and deployment

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions runs these checks on pushes and pull requests. The `website-asset-radar` project in Fareza's projects is linked to this repository; pushes to `main` deploy production and pull requests get preview deployments. Vercel's Next.js adapter detects `output: "export"` and serves the static export. Leave Vercel's Output Directory override unset so the adapter can read Next.js build manifests. The primary public domain is `https://gameassetradar.top`; `www.gameassetradar.top` redirects to it. Set `NEXT_PUBLIC_SITE_URL` at build time when assigning a different public domain. Run `npx tsx scripts/generate-social-images.ts` to regenerate the social cover with that domain; its artwork comes from the existing licensed Nature Kit preview.

No production secrets are required. The daily maintenance agent needs GitHub access to propose a PR; visitors never need an account. The Cursor automation is prepared in this repository and must be saved and activated in the owner's Cursor account.

## Credits

Assets belong to their original creators. Download the complete packs from the linked publishers. Kenney and Poly Haven's licensed asset content is CC0; their logos and unrelated website content are not used as AssetRadar branding. Original application code is MIT licensed; asset permissions are documented separately.
