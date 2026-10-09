# Catalog growth verification — 9 October 2026

The daily workflow now targets at least **50 genuinely new verified items** in
total across permanent free, limited free and curated deals. Its regular ceiling
is 100 additions, 150 candidate inspections, 90 minutes and 500 MB. Unsupported,
blocked or unverified sources do not become published records. The separate
initial-backfill mode can fill a larger backlog without resetting daily counts.

## This implementation run

| Catalog | Before | After | Added |
| --- | ---: | ---: | ---: |
| Permanent free | 91 | 241 | 150 |
| Verified promotions | 9 | 11 | 2 |
| Total | 100 | 252 | **152** |

The permanent-free backfill added 49 Kenney packs, 51 Poly Haven texture
materials and 50 ambientCG materials. It inspected 152 products in 1,040 seconds
and downloaded 122,382,771 bytes. Two Kenney road packs failed archive-license
verification; the runner replaced them with other candidates rather than
stopping. Optimized new local previews total 4,752,022 bytes, plus a 12,489-byte
licensed audio sample. Full asset archives are not hosted.

Existing records retain their metadata and verification dates. A daily rerun
after the target was met left the catalog unchanged. Rechecks, revivals and
candidate links are not counted as new additions.

The two new deals have first-party purchase-price, currency, commercial-tier,
rating and absolute-expiry evidence in `data/offer-evidence/`:

- [Pixelwood Valley — Premium](https://gowldev.itch.io/pixelwood-valley):
  USD 9.00 → 4.23, 53% off; Radar Score 72, Deal Score 70. The separate free
  noncommercial version is excluded. Expires 13 October 2026 at 16:03 UTC.
- [SideScroll Worlds — Set5](https://szadiart.itch.io/sidescroll-worlds-set5):
  USD 12.00 → 4.80, 60% off; Radar Score 71, Deal Score 71.
  Expires 11 October 2026 at 20:00 UTC.

These are verification snapshots, not promises that a price remains available.
The website independently hides expired or 48-hour-stale promotions.

## Remaining source limits

Unity's [Asset Store Terms section 3.3](https://unity.com/legal/as-terms) require
a separate agreement for automated access. No Unity free-catalog or Autumn Sale
scraper is enabled. Fab's current automated access was blocked and was not
bypassed. itch.io campaign candidates need exact-product price, license and
curation verification; being listed on a sale page is insufficient. Other
featured publishers remain monitored under their existing access policies and
need a supported product-evidence adapter before automatic importing.

The updated Cursor prompt and daily guide are repository files. They must be
used by the automation saved in the owner's Cursor account; changing repository
files does not activate or change an account schedule.
