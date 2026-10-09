# Radar Score v3, Deal Score and USD prices

Radar Score is a reproducible **editorial estimate**, not measured asset quality or
an engine benchmark. Missing evidence must stay unknown. Never boost a grade to
hit a target score, add random variation, or treat a high discount as quality.
The implementation is `lib/radar-score.ts`; detail pages show the factor breakdown
and evidence limitations.

| Factor | Maximum | Rule |
| --- | ---: | --- |
| Quality and rating evidence | 40 | Half editorial grade, half moderated marketplace average; unknown ratings limit quality to 20. |
| Documented contents/usability | 30 | Published contents receive 80% of their graded contribution because paid files have not been audited. |
| Commercial license flexibility | 15 | CC0 100%; commercial creator/attribution license 80%; Personal revenue-limited tier 70%; unverified commercial use 0. Round the contribution. |
| Creator/source trust | 15 | Evidence-supported editorial reputation grade. |

**Radar Score contains no price, discount or value component.** The same asset
with unchanged quality evidence keeps the same Radar Score when its price changes.

Grades 0–5 interpolate these anchors: 0 = 0%, 1 = 10%, 2 = 25%, 3 = 50%,
4 = 75%, 5 = 100%. A grade of 3 is adequate, 4 strong and 5 exceptional.
Review previews, documented scope, demo/documentation availability, compatibility
limits, commercial terms and rating counts. Do not claim to have inspected paid
archives or tested engines. Each grade is a judgment; the rationale must explain
its evidence. More information can change a score.

Marketplace mean moderation uses `(rating × count + 3.5 × 40) / (count + 40)`.
The 40-rating prior is a disclosed scoring assumption, never a fabricated
marketplace rating or confidence interval. It reduces the influence of small
perfect samples. Displayed marketplace stars/counts remain the observed values.

Permanent-free assets currently lack marketplace ratings and engine tests. Their
quality is provisional at 20/40. Completeness uses
checked formats (4), hashed source evidence (4), licensed preview proof (4),
known scope (1), useful editable/interchange formats (up to 3), and a playable
original OGG sample (2). SVG earns 3 format points; 3D FBX/OBJ/GLB earns up to 3;
EXR earns 2. More files beyond a known scope never improve the score. Verified
Kenney/Poly Haven evidence earns 12/15 source trust. Multiply the completeness
subtotal by 1.5 and round. License points follow the
same commercial-license rubric. Provisional scores do not mean poor quality.

## Separate Deal Score

| Factor | Maximum | Rule |
| --- | ---: | --- |
| Asset quality | 35 | Radar Score × 0.35, rounded. |
| Value for asking price | 35 | Anchored value grade × 35, rounded; evidence-supported usefulness for the actual price. |
| Verified price reduction | 20 | `(1 − salePrice / originalPrice) × 20`, bounded and rounded; actual verified prices, not rounded badge percentages. |
| Commercial terms | 10 | Same license fractions as Radar Score, rounded. |

Permanent-free assets have `dealScore: null`. Promotions have a separately
derived numeric `dealScore`; a 100% discount does not automatically earn 100.
The two scores are consistent across cards, filters, detail pages and validators.

Deals require 30% off, Radar Score 60+, Deal Score 70+, quality/value grades at least 3,
commercial permission, and at least 4/5 marketplace stars when known. The updater
recalculates both scores without advancing verification dates. Free importers and
`npm run catalog:enrich` calculate the free method from existing evidence;
enrichment is not a new source check.

## USD display without false prices

Visitor UI uses English, `en-US` formatting, and USD price displays. Source
currency, original/sale amounts, tier and evidence stay unchanged in the catalog.
`lib/usd-prices.ts` converts only for comparison, labels non-USD amounts `≈`,
and shows the date and ECB attribution. Direct USD observations have no
approximation mark.

`npm run prices:refresh` fetches the
[official ECB daily XML](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml)
once, after checking robots and waiting its published five-second crawl delay.
It follows no redirects, bounds responses to 1 MB, uses a 20-second timeout,
and writes `data/exchange-rates.json` only after validation. The snapshot records
published date, check time, EUR base, rates and SHA-256. The raw feed is kept in
ignored `.cache/ecb-rates-feed.xml`. It cannot change product evidence or lastChecked.

Conversion uses `amount × USD-per-EUR / source-currency-per-EUR`. Unsupported,
invalid, future or seven-day-old rates suppress estimates and direct visitors
to the source; they never fall back to relabeling the original amount. Tiny
positive prices display `< $0.01` rather than zero. Source freshness and expiry
apply independently to both USD and converted offers.

ECB rates are informational references, not marketplace checkout quotes.
Regional prices, tiers and taxes may differ. Reuse and attribution follow the
[ECB copyright conditions](https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html).
Daily agents may update only the validated snapshot via the existing script,
include its date/source in the PR, and preserve the snapshot on collection failure.
