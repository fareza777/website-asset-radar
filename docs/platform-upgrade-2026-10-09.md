# Game Asset Radar: existing-platform audit and upgrade

## Audit before implementation

Next.js 16 static export, TypeScript, Tailwind 4 plus shared CSS, JSON catalog and Vercel are retained. The starting catalog contains 82 free packs, 9 verified promotions and 12 curated collections. Favorites, personal collections, original audio artwork, publisher previews, motion preferences and 48-hour offer freshness already work and must remain.

Observed gaps: the homepage repeats large equal grids and gives search little emphasis; filters omit publisher, format, availability and discount thresholds; engine labels conflate importable files with native projects; quality scoring includes price; there are no publisher profile routes or ten-publisher watch list. The catalog is predominantly Kenney, so publisher counts must reflect actual records rather than imply coverage that does not exist.

## Chosen design and implementation stages

1. Extend the shared data helpers: quality-only Radar Score, independent Deal Score, evidence-based engine statuses, featured publisher identities and combined URL filters. Recalculate derived fields while preserving observed prices, ratings and verification dates.
2. Reuse the dark charcoal/mint brand, Geist typography, animated sidebar and real artwork. Put a large search within the hero, add a compact Today's Radar selection, focused free and promotion sections, ten typographic publisher tiles, categories and existing collections. Provide a desktop filter sidebar and accessible mobile drawer, result chips, copyable URLs and browser history.
3. Statically generate publisher profiles and an all-assets discovery route with titles, canonicals, OpenGraph and relevant schema. Empty publisher catalogs say so and link to the official catalog; no fabricated offers, affiliation or logos.
4. Extend the existing daily workflow with a ten-publisher source monitor and candidate-only change report. Respect permission reviews, robots, pacing, response limits and access protection. Product price/license checks are separate from index observation. Update the Cursor prompt and owner guide with priority, quantity ceilings and draft-PR review.
5. Verify combined filters and history, engine evidence, price-independent quality scoring, policy boundaries, saved-library behavior, static SEO export, desktop/mobile composition, lint, types, tests, build, CI and exact production deployment.

## Factual constraints

English UI and USD comparison prices remain. Publisher marketing media is never silently copied; existing licensed previews and credited direct gallery images remain. Importable means a documented format match, not that materials/scripts work without setup. Native means publisher-listed engine packaging, not a benchmark. Quaternius's current QAL differs from older CC0 labels, and CraftPix website content restrictions require collection permission review. A publisher profile check is never a new product price or license check.

## Implementation and validation

The existing platform now has `/explore/`, `/publishers/`, and ten statically
generated `/publisher/<slug>/` profiles; all existing routes remain. Homepage
sections and cards reuse existing previews, offers, favorites and collections.
The desktop sidebar and mobile native-dialog filters combine availability,
engine/status, discount, publisher, type, genre, license, format and source with
shareable URLs and browser back/forward. The selected engine appears first on
cards. Quality scores are currently 67–71 for unrated free packs and 66–82 for
promotions; Deal Scores are 73–89. Observed prices, currencies, licensing,
ratings, curation inputs, source identity and actual check dates are unchanged.

The publisher watcher observed eight public indices successfully and correctly
skipped the two permission-review sources. Candidate-only discovery is divided
across sources, and index-only timestamp churn cannot create a maintenance PR.
Cursor documentation retains one draft PR, 50 combined new verified items,
150 candidate inspections, 50 promotion rechecks and 20 free rechecks per Jakarta
day, within 60 minutes and 500 MB of new archives. The final ten minutes are
reserved for checks/review. Schedule activation remains in the owner's Cursor
account; repository files alone do not activate a scheduled cloud agent.

Verification covers score reproducibility and independence from price, URL
round-trips, combined filters, exact publisher attribution, package/format
compatibility, policy/provenance validation, unknown ratings, expiry, stale
claims, duplicate URLs and saved-library behavior. The export check validates
131 public SEO pages, 91 asset pages, all ten publisher profiles, canonicals,
OpenGraph, sitemap and robots; promotional purchase claims wait for the browser
clock on every public page. Browser inspection at desktop and 390px mobile
confirmed readable layout, no horizontal overflow, filter/history/share
behavior, native drawer Escape and focus restoration, honest publisher counts,
preserved favorites and the original collection picker.
