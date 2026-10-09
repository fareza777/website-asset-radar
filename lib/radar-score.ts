import type { Asset, DirectoryAsset, Promotion } from "./types";

export const RADAR_SCORE_VERSION = 2;
export const RATING_PRIOR_COUNT = 40;
export const RATING_PRIOR_MEAN = 3.5;
export const SCORE_FACTORS = {
  quality: { label: "Quality & rating evidence", maximum: 30 },
  value: { label: "Value for the price", maximum: 20 },
  discount: { label: "Verified discount", maximum: 10 },
  completeness: { label: "Documented contents & usability", maximum: 20 },
  license: { label: "Commercial license flexibility", maximum: 10 },
  reputation: { label: "Creator / source trust", maximum: 10 },
} as const;
export type ScoreBreakdown = Record<keyof typeof SCORE_FACTORS, number>;

// Anchored editorial rubric: 3 = adequate (50%), 4 = strong (75%),
// 5 = exceptional (100%). Interpolate fractional grades, never add jitter.
export function gradeFraction(grade: number): number {
  const anchors = [0, 0.1, 0.25, 0.5, 0.75, 1];
  const safe = Number.isFinite(grade) ? Math.max(0, Math.min(5, grade)) : 0;
  const lower = Math.floor(safe);
  return lower === 5
    ? 1
    : anchors[lower] + (anchors[lower + 1] - anchors[lower]) * (safe - lower);
}

/** A conservative estimate from a mean and count, not a statistical interval. */
export function adjustedRating(rating: number, count: number): number {
  return (
    (rating * count + RATING_PRIOR_MEAN * RATING_PRIOR_COUNT) /
    (count + RATING_PRIOR_COUNT)
  );
}

export function scoreBreakdown(offer: Promotion): ScoreBreakdown {
  const editorialQuality = gradeFraction(offer.curation.quality);
  const quality =
    offer.rating !== null && offer.reviewCount !== null
      ? (editorialQuality +
          gradeFraction(adjustedRating(offer.rating, offer.reviewCount))) /
        2
      : Math.min(editorialQuality, 0.5);
  // Use the actual price ratio, not the rounded percentage badge.
  const discount = Math.max(
    0,
    Math.min(1, 1 - offer.salePrice / offer.originalPrice),
  );
  return {
    quality: Math.round(quality * SCORE_FACTORS.quality.maximum),
    value: Math.round(gradeFraction(offer.curation.value) * 20),
    discount: Math.round(discount * 10),
    // Published contents are useful evidence, but not a full paid-file audit.
    completeness: Math.round(
      gradeFraction(offer.curation.completeness) * 20 * 0.8,
    ),
    license: !offer.commercialUse
      ? 0
      : offer.license === "CC0"
        ? 10
        : offer.licenseTier === "Personal"
          ? 7
          : 8,
    reputation: Math.round(gradeFraction(offer.curation.reputation) * 10),
  };
}

type FreeScoreInput = Pick<
  Asset,
  | "formats"
  | "dimension"
  | "fileCount"
  | "commercialUse"
  | "license"
  | "source"
  | "evidenceSha256"
  | "previewProvenance"
  | "audioPreview"
>;

export function freeScoreBreakdown(asset: FreeScoreInput): ScoreBreakdown {
  const formats = new Set(asset.formats.map((format) => format.toUpperCase()));
  const proof = /^[a-f0-9]{64}$/.test(asset.evidenceSha256);
  const licensedPreview =
    asset.previewProvenance.license === asset.license &&
    /^[a-f0-9]{64}$/.test(asset.previewProvenance.sha256);
  // Reward documented usability, not the number of files or unrelated formats.
  const interchange = ["FBX", "OBJ", "GLB"].filter((f) =>
    formats.has(f),
  ).length;
  const reusableFormats = formats.has("SVG")
    ? 3
    : asset.dimension === "3D" && interchange
      ? Math.min(3, interchange + 1)
      : formats.has("EXR")
        ? 2
        : 0;
  return {
    quality: 15, // Unknown marketplace ratings and no in-engine quality test.
    value: asset.commercialUse ? 15 : 0, // Zero cost is not proof of great value.
    discount: 0, // No former paid price is known for a permanent-free pack.
    completeness:
      (formats.size ? 4 : 0) +
      (proof ? 4 : 0) +
      (licensedPreview ? 4 : 0) +
      (asset.fileCount ? 1 : 0) +
      reusableFormats +
      (asset.audioPreview && formats.has("OGG") ? 2 : 0),
    license: !asset.commercialUse ? 0 : asset.license === "CC0" ? 10 : 8,
    reputation:
      proof && ["Kenney", "Poly Haven"].includes(asset.source) ? 8 : 0,
  };
}

function totalScore(scores: ScoreBreakdown): number {
  return Math.max(
    0,
    Math.min(
      100,
      Object.values(scores).reduce((sum, n) => sum + n, 0),
    ),
  );
}
export function calculateRadarScore(offer: Promotion): number {
  return totalScore(scoreBreakdown(offer));
}
export function calculateFreeScore(asset: FreeScoreInput): number {
  return totalScore(freeScoreBreakdown(asset));
}

export function scoreEvidenceNote(asset: DirectoryAsset): string {
  if (asset.type === "free")
    return "Provisional: quality is neutral because marketplace ratings and in-engine testing are unavailable. Formats, license and preview files were checked. A lower score reflects missing quality evidence, not a poor-quality verdict.";
  if (asset.rating === null || asset.reviewCount === null)
    return "Provisional: no published ratings. Quality points are limited; contents are publisher-listed and have not been tested in an engine.";
  return `Based on published contents and ${asset.reviewCount} marketplace ratings. Small rating samples are moderated; paid files and in-engine performance have not been tested.`;
}
