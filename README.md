# AssetRadar

A compact creative workspace for discovering genuine free game-development assets. Built with Next.js, TypeScript, Tailwind CSS, and a verified static JSON catalog.

[Visit AssetRadar](https://website-asset-radar-xi.vercel.app/)

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
- Four curated collections and static pages for every asset and category.
- Canonical URLs, metadata, social previews, structured data, sitemap, and robots rules.
- Original audio samples load only when played; all previews are local, optimized WebP files.

The initial library contains **24 CC0 assets: 21 from Kenney and 3 texture materials from Poly Haven**, verified on 8 October 2026. [Provenance and licensing](docs/catalog-provenance.md) explains the evidence and preview permissions. Catalog metadata is in `data/assets.json`; evidence is in `data/evidence/`. Publisher-listed file counts are preserved where available. “Latest” means added to AssetRadar, not the asset's original release date. Genre placement is editorial. Engine filters describe supported file formats; engine setup may be required.

## Catalog maintenance

```sh
npm run catalog:validate          # Schema, dates, deduplication, media, and evidence
npm run catalog:check             # Read-only live source/license/download checks
npm run catalog:discover          # Candidates only; no catalog mutation
npm run catalog:check -- --limit=5 --write
```

Requests use the explicit allowlist in `scripts/source-policy.ts`, source robots rules where applicable, an identifying User-Agent, and pacing. Discovery and check reports are written to the ignored `.cache/` directory. An unavailable or ambiguous source fails verification; no failed check is stamped as current.

Approved Kenney candidates can be imported with a reviewed descriptor file:

```sh
npx tsx scripts/seed-catalog.ts --input=.cache/kenney-imports.json
npx tsx scripts/seed-polyhaven.ts --input=.cache/polyhaven-imports.json
```

Importers retain existing entries and verification dates, verify new source evidence, and generate previews from permitted asset files. They never overwrite the catalog with an initial seed. See [the daily Cursor Automation setup](docs/automation.md) for descriptor formats, limits, the ready-to-paste prompt, and draft PR publishing.

## Checks and deployment

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions runs these checks on pushes and pull requests. The `website-asset-radar` project in Fareza's projects is linked to this repository; pushes to `main` deploy production and pull requests get preview deployments. Vercel's Next.js adapter detects `output: "export"` and serves the static export. Leave Vercel's Output Directory override unset so the adapter can read Next.js build manifests. Set `NEXT_PUBLIC_SITE_URL` at build time when assigning a different public domain. Update the social cover's domain text when changing domains.

No production secrets are required. The daily maintenance agent needs GitHub access to propose a PR; visitors never need an account. The Cursor automation is prepared in this repository and must be saved and activated in the owner's Cursor account.

## Credits

Assets belong to their original creators. Download the complete packs from the linked publishers. Kenney and Poly Haven's licensed asset content is CC0; their logos and unrelated website content are not used as AssetRadar branding. Original application code is MIT licensed; asset permissions are documented separately.
