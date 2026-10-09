# Catalog provenance

The launch catalog was checked on **8 October 2026** with 21 Kenney packs and three Poly Haven texture materials. On **9 October 2026 (Asia/Jakarta)**, 58 more Kenney packs passed the same source-page and included-archive license checks. The free catalog now has 79 Kenney packs and three Poly Haven materials, with eight individual CC0 audio samples. Full packs remain at their original publishers.

## Kenney

Each record was checked against the pack's own source-page License field, the first-party free ZIP download, and its included `License.txt`. The evidence file stores the source URL, UTC timestamp, HTTP status, page and archive SHA-256, included license text, media input filename, media input SHA-256, and observed formats/tags.

Image previews come from `Sample.png`, `Preview.png`, or an actual controller graphic **inside the CC0 archive**. Preview footers containing creator branding were cropped where applicable; previews were optimized to 800 × 450 WebP. The hero uses the licensed Nature Kit sample. Audio previews contain one original OGG from each pack, and the gallery waveforms were measured from decoded samples. They do not represent the full audio collection.

Kenney permits personal and commercial use of its CC0 game assets without mandatory credit; its logo is separate. See [Kenney's source guidance](https://kenney.nl/support) and the included license in each evidence record.

## Poly Haven

Metadata and file links were obtained through the permitted public API with an identifying User-Agent. Each record has the asset's API response hash, authors, asset type, current global asset-license evidence hash, a downloaded diffuse texture's MD5 checked against the API, and its SHA-256. Source-page reachability and actual texture-file links were also checked.

Previews are crops of actual **CC0 diffuse texture maps** from the download endpoint. Website example renders, thumbnails, logos, and user portraits were not copied. AssetRadar's previews show the material's color map rather than claiming to be a complete PBR render. See [Poly Haven's asset and website permissions](https://polyhaven.com/license) and its [machine access guidance](https://polyhaven.com/llms.txt).

## What verification means

`verifiedAt` is supported by `checkedAt` or a successful `lastLinkCheckAt` in the evidence, interpreted in Asia/Jakarta. Production validation rejects future or inconsistent dates, duplicated identities, incorrect source/license URLs, mismatched preview rights, missing media, and missing evidence.

Rechecks verify the current publisher license, asset identity, source link, and archive or texture-download reachability. A changed Kenney archive URL requires inspecting its included license and media again. Original archive hashes describe the file inspected when imported; a later HEAD check does not claim a new archive hash. Files and formats remain based on the actual inspected archive or permitted API data.

Verification records describe a completed check, not a promise that an external source will never change. Ambiguous or conflicting permissions are excluded and sent for review. Quaternius was excluded from the launch catalog because current pack-level CC0 labels and its newer global license were inconsistent.

Engine labels describe format import support rather than an official integration or a tested engine project. In particular, Epic's [current import documentation](https://dev.epicgames.com/documentation/unreal-engine/migrating-assets-from-unity-to-unreal-engine) includes OGG audio. Genre/category labels and collection membership are AssetRadar's editorial organization.

## Promotion evidence and media

The first discovery selection contains three Fab limited-time-free packs and two itch.io deals, observed on their first-party product/license pages on 8 October 2026 at 16:41:49 UTC. Evidence records in `data/offer-evidence/` preserve original/sale prices, displayed currency, license tier and qualifications, actual marketplace stars/rating counts, commercial permissions and known absolute deadlines. Fab's Personal-tier prices were displayed in IDR; itch.io prices were displayed in USD. The directory does not invent exchange-rate conversions.

Fab's campaign explicitly ends on 20 October at 09:59 Eastern time, corresponding to 13:59 UTC. Winlu's actual campaign states 30 October at 18:10 UTC. Oak Woods exposes a relative sale timer but no absolute end time was established; its expiresAt remains null and it has no invented countdown. These observations are historical verification evidence, not a guarantee that the source cannot change. The 48-hour freshness limit applies to all offers, including those with later known expiry.

Fab Standard and the itch.io creators' commercial licenses allow project use subject to their own terms; none of these promotions is represented as CC0. No paid pack archives or marketplace artwork files were copied into this repository. Eight visual promotions now link directly to static previews observed in their exact public publisher galleries, with creator credit and separate image-check timestamps. Fab images stay on `media.fab.com`; itch.io images use the publisher gallery's observed 794px CDN variants on `img.itch.zone`. This records source provenance, not a new image copyright license or a fresh price verification. `preview` and `thumbnailPermission` remain null for these remotely linked images. A local thumbnail requires explicit recorded image-use permission. The licensed Kenney/Poly Haven artwork elsewhere in the site remains intact.

Four further deals were verified through robots-permitted, paced requests to their exact itch.io product pages on 8 October at 21:25–21:26 UTC: Elektrobear's 80 Songs ($20 → $10), Castle of Despair ($2 → $1), Winlu Fantasy Interior ($20 → $14), and GandalfHardcore Medieval Fantasy Tiles ($9.99 → $6.49). Each public purchase panel explicitly showed both prices; the corresponding marketplace Product/Offer JSON-LD agreed on sale price and currency, rating count, and absolute UTC expiry. Creator commercial-use terms were read on each product page. Paid archives were not downloaded. Castle of Despair's older description includes a free-assets sentence; its current purchase panel and Offer both require $1, and its priceNote discloses that discrepancy rather than labeling it free. Candidates without an explicit original price or readable commercial terms were excluded.

Elektrobear's audio promotion retains the original animated audio deck. Visual promotions also retain original scene fallbacks if a publisher image fails or is unavailable. These illustrations are labeled editorial, not screenshots or included product contents. No premium audio samples are hosted. CSS animation pauses offscreen, when the tab is hidden, on a saved user pause, or under the system's reduced-motion preference. Publisher previews use static image formats so they cannot ignore the visitor's motion preference through an autoplay GIF.

Radar Score is an editorial calculation based on disclosed inputs and observed information. Marketplace ratings are reproduced only where observed and are kept distinct from editorial judgments. Contents/formats and creator descriptions were reviewed; these packs were not performance-tested in an engine.

On 9 October the [v3 scoring rubric](radar-score.md) separated price-independent Radar Score from Deal Score and recalculated the catalog without changing source prices, currency, ratings, licenses, curation inputs or verification dates. Free packs retain provisional quality because published ratings and engine tests are unavailable. USD is the display currency; IDR observations above remain original evidence. Approximate USD equivalents use the official ECB daily feed dated 8 October 2026 (EUR base: USD 1.1186, IDR 20045.31), recorded in `data/exchange-rates.json` with the actual fetch time and feed hash. Conversion is labeled and does not constitute a new publisher price check.

Ten publisher profiles were checked against official pages on 9 October. Profile verification and index monitoring do not verify individual products. The original 82 free assets and 9 promotion identities remain the catalog. Other featured profiles link to official catalogs and do not fabricate listing counts. The public-index watcher successfully observed eight configured sources; Synty and CraftPix remain permission-review skips. Engine labels derive from recorded content formats/packages and the primary documentation in `data/engine-formats.json`; no in-engine performance test is claimed.

## Application fonts

Geist Sans and Geist Mono are self-hosted by Next.js under the SIL Open Font License. The original notice is included at `public/licenses/geist-ofl.txt`, from [Vercel's font repository](https://github.com/vercel/geist-font/blob/main/OFL.txt).
