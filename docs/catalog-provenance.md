# Catalog provenance

The launch catalog was checked on **8 October 2026**. It includes 21 Kenney packs and three Poly Haven texture materials. AssetRadar hosts small permitted previews and four individual audio samples, and links visitors to the original publisher for full downloads.

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

## Application fonts

Geist Sans and Geist Mono are self-hosted by Next.js under the SIL Open Font License. The original notice is included at `public/licenses/geist-ofl.txt`, from [Vercel's font repository](https://github.com/vercel/geist-font/blob/main/OFL.txt).
