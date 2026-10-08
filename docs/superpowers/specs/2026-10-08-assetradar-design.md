# AssetRadar design

Build a public discovery library for independent game developers. Success is a polished, responsive interface with fast search, useful filters, genuine free assets, clear license evidence, SEO asset pages, local favorites, and reviewable daily catalog maintenance. The user authorizes GitHub push and production deployment to their Vercel account.

## Experience

An original dark creative library: near-black neutral surfaces, soft mint accents, restrained movement, Geist typography, authentic asset imagery, and a persistent desktop navigation rail. Design variance 7, motion intensity 4, visual density 5. The home page has a split editorial hero, category navigation, an image-led catalog, and curated collections. Mobile uses a compact header and an accessible filter drawer. Asset pages show the original source, verified license evidence, factual file formats, and the actual verification date.

## Architecture

Next.js App Router, TypeScript, Tailwind CSS, and a validated JSON catalog. All public pages are statically exported, including assets, categories, collections, license information, sitemap, and robots. Only search, filters, view preferences, favorites, and personal collections need client state. No login, analytics tracker, paid database, or runtime API. Favorites and personal collections use versioned localStorage, with storage failures handled in the interface.

## Integrity

Seed only items confirmed on their original public source. Separate editorial genres from source facts. Engine filters describe importable formats, not official integrations. No invented popularity, downloads, ratings, release dates, or compatibility claims. Store page, license, verification evidence, preview provenance, and content checksum. Never display a generated illustration as an asset preview. CC0 previews may be produced from licensed pack contents; website artwork needs its own permission. Link users to creators for the actual downloads.

## Maintenance

Provide a daily Cursor Automation prompt and setup for 08:00 Asia/Jakarta. Discovery is restricted to documented sources and respects robots rules and rate limits. Scripts discover candidates, verify status and licensing, canonicalize and deduplicate URLs, and validate catalog integrity. Uncertain licenses or link failures enter a report, never an automatically approved catalog entry. Catalog changes open a draft PR, with no automatic merge or direct production push. Activation is performed in Cursor using its supported automation interface.

## Verification

Unit tests cover combined filters, search, URL normalization, duplicate rejection, persisted-data validation, and license verification boundaries. Check the real catalog and source links, lint, typecheck, production build, keyboard navigation, empty states, mobile layout, persistence, and metadata. Deploy only the verified commit; then confirm the live site serves the expected pages.
