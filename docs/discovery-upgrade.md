# Discovery upgrade

AssetRadar remains a curated free game asset directory. Preserve the existing
dark/mint palette, Geist typography, sidebar, hero artwork, cards, favorites and
collections. Increase reading text and controls to 14–16px and card titles to
17px. Keep the homepage in this order: hero/search, Free Today, Deals on Our
Radar, Featured Free Assets, Recently Discovered, categories, collections.

## Data and publication

Keep permanent free assets in `data/assets.json`. Add `data/offers.json` and
`data/offer-archive.json` for promotions. Share directory fields and card styles;
promotions have strict price/license evidence, a canonical product URL separate
from the future affiliate destination, a verification timestamp, and a maximum
48-hour verification window. Unknown ratings and deadlines stay null. Public
cards and outbound claim buttons disappear at the earlier of expiry or the
verification deadline. Daily static rebuilds update HTML and structured data.
Archived offer pages remain useful but never advertise an expired price.

Require real first-party evidence for original and sale prices, currency,
commercial rights and any stated expiry. No source access bypasses, invented
prices or downloaded premium archives. Where artwork rights are unconfirmed,
use an original editorial cover that explicitly links to previews at the source.
An optional licensed thumbnail needs recorded permission/provenance.

Radar Score is a disclosed editorial signal, not a marketplace rating. Use six
weighted factors: quality, value, discount, completeness, commercial license and
source/creator trust. Unknown external ratings are not manufactured. Require
an explicit curation rationale and minimum score/discount for paid deals.

## Routes and runtime

Add `/free`, `/free-today`, `/deals`, `/asset/[slug]`, `/category/[slug]`.
Reuse the existing free detail pages and gallery. Keep compatibility for old
URLs with Vercel permanent redirects and canonicalize to the new routes.
Use static CollectionPage/ItemList, CreativeWork and breadcrumb schema. Offer
schema is omitted for promotions because static HTML could outlive a live price.
No login, API route, paid service, polling backend or new package is needed.

## Implementation and verification

1. Test price math, UTC deadlines, freshness, evidence, duplicate canonical
   identities, score and curation rejection. Implement shared promotion logic.
2. Add the updater, quarantine/archive behavior and source policies. Seed only
   offers independently checked on the live first-party pages.
3. Reuse cards, gallery, hero and sidebar; add lightweight promotion sections
   and larger typography. Add canonical routes and metadata.
4. Update the Cursor daily maintenance prompt and draft-PR helper to include
   offers/evidence/archive. Do not claim an account scheduler is active.
5. Run the complete test suite, lint, typecheck, export SEO verification, browser
   checks at desktop/mobile, then push and verify the Vercel production build.

Adversarial checks: wrong currency or original price; a stale/future verification;
unknown timezone; duplicate affiliate/tracking URL; expired free claim; invalid
license evidence; unaudited publisher image; misleading rating; a low-quality
large discount; countdown without an authoritative deadline.
