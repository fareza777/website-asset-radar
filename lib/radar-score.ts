import type { Asset, DirectoryAsset, Promotion } from "./types";

export const RADAR_SCORE_VERSION = 3;
export const RATING_PRIOR_COUNT = 40;
export const RATING_PRIOR_MEAN = 3.5;
export const SCORE_FACTORS = {
  quality: { label: "Quality & rating evidence", maximum: 40 },
  completeness: { label: "Documented contents & usability", maximum: 30 },
  license: { label: "Commercial license flexibility", maximum: 15 },
  reputation: { label: "Creator / source trust", maximum: 15 },
} as const;
export const DEAL_FACTORS = {
  quality: { label: "Asset quality", maximum: 35 },
  value: { label: "Usefulness for the price", maximum: 35 },
  discount: { label: "Verified price reduction", maximum: 20 },
  license: { label: "Commercial terms", maximum: 10 },
} as const;
export type ScoreBreakdown = Record<keyof typeof SCORE_FACTORS, number>;

// 3 = adequate (50%), 4 = strong (75%), 5 = exceptional (100%).
export function gradeFraction(grade: number): number {
  const anchors = [0, 0.1, 0.25, 0.5, 0.75, 1];
  const safe = Number.isFinite(grade) ? Math.max(0, Math.min(5, grade)) : 0;
  const lower = Math.floor(safe);
  return lower === 5 ? 1 : anchors[lower] + (anchors[lower + 1] - anchors[lower]) * (safe - lower);
}

/** A scoring assumption, not an observed rating or statistical interval. */
export function adjustedRating(rating: number, count: number): number {
  return (rating * count + RATING_PRIOR_MEAN * RATING_PRIOR_COUNT) / (count + RATING_PRIOR_COUNT);
}
function licenseFraction(asset: Pick<DirectoryAsset, "commercialUse" | "license"> & { licenseTier?: string | null }): number {
  return !asset.commercialUse ? 0 : asset.license === "CC0" ? 1 : asset.licenseTier === "Personal" ? 0.7 : 0.8;
}
export function scoreBreakdown(offer: Promotion): ScoreBreakdown {
  const editorial = gradeFraction(offer.curation.quality);
  const quality = offer.rating !== null && offer.reviewCount !== null
    ? (editorial + gradeFraction(adjustedRating(offer.rating, offer.reviewCount))) / 2
    : Math.min(editorial, 0.5);
  return {
    quality: Math.round(quality * 40),
    // Listing-only contents are useful evidence, not a paid-file audit.
    completeness: Math.round(gradeFraction(offer.curation.completeness) * 30 * 0.8),
    license: Math.round(licenseFraction(offer) * 15),
    reputation: Math.round(gradeFraction(offer.curation.reputation) * 15),
  };
}
type FreeScoreInput = Pick<Asset,
  "formats" | "dimension" | "fileCount" | "commercialUse" | "license" |
  "source" | "evidenceSha256" | "previewProvenance" | "audioPreview"
>;
export function freeScoreBreakdown(asset: FreeScoreInput): ScoreBreakdown {
  const formats = new Set(asset.formats.map((format) => format.toUpperCase()));
  const proof = /^[a-f0-9]{64}$/.test(asset.evidenceSha256);
  const licensedPreview = asset.previewProvenance.license === asset.license && /^[a-f0-9]{64}$/.test(asset.previewProvenance.sha256);
  const interchange = ["FBX", "OBJ", "GLB"].filter((f) => formats.has(f)).length;
  const reusable = formats.has("SVG") ? 3 : asset.dimension === "3D" && interchange
    ? Math.min(3, interchange + 1) : formats.has("EXR") ? 2 : 0;
  const usability = (formats.size ? 4 : 0) + (proof ? 4 : 0) + (licensedPreview ? 4 : 0) +
    (asset.fileCount ? 1 : 0) + reusable + (asset.audioPreview && formats.has("OGG") ? 2 : 0);
  return {
    quality: 20, // Neutral quality: no marketplace ratings or engine testing.
    completeness: Math.round(usability * 1.5),
    license: Math.round(licenseFraction(asset) * 15),
    reputation: proof && ["Kenney", "Poly Haven"].includes(asset.source) ? 12 : 0,
  };
}
function totalScore(scores: Record<string, number>): number {
  return Math.max(0, Math.min(100, Object.values(scores).reduce((sum, n) => sum + n, 0)));
}
export function calculateRadarScore(offer: Promotion): number { return totalScore(scoreBreakdown(offer)); }
export function calculateFreeScore(asset: FreeScoreInput): number { return totalScore(freeScoreBreakdown(asset)); }

export function dealScoreBreakdown(offer: Promotion) {
  const ratio = Number.isFinite(offer.originalPrice) && offer.originalPrice > 0 && Number.isFinite(offer.salePrice)
    ? Math.max(0, Math.min(1, 1 - offer.salePrice / offer.originalPrice)) : 0;
  return {
    quality: Math.round(calculateRadarScore(offer) * 0.35),
    value: Math.round(gradeFraction(offer.curation.value) * 35),
    discount: Math.round(ratio * 20),
    license: Math.round(licenseFraction(offer) * 10),
  };
}
export function calculateDealScore(offer: Promotion): number { return totalScore(dealScoreBreakdown(offer)); }
export function scoreEvidenceNote(asset: DirectoryAsset): string {
  if (asset.type === "free") return "Provisional quality score: no marketplace ratings or in-engine tests. Formats, source, license and preview files were checked. Missing quality evidence is not a poor-quality verdict. Price and discounts do not affect Radar Score.";
  if (asset.rating === null || asset.reviewCount === null) return "Provisional quality score: no published ratings. Contents are publisher-listed; paid files have not been tested in an engine. Price and discounts do not affect Radar Score.";
  return `Based on published contents and ${asset.reviewCount} marketplace ratings. Small rating samples are moderated; paid files and engine performance have not been tested. Price and discounts do not affect Radar Score.`;
}
