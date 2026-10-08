import type { Asset, Promotion } from "./types";

export const OFFER_FRESHNESS_MS = 48 * 60 * 60 * 1000;
export const MIN_DEAL_SCORE = 70;
export const MIN_DEAL_DISCOUNT = 30;
export const MIN_DEAL_GRADE = 3;

export function calculateDiscount(original: number, sale: number): number {
  if (
    !Number.isFinite(original) ||
    !Number.isFinite(sale) ||
    original <= 0 ||
    sale < 0 ||
    sale >= original
  )
    throw new Error(
      "A promotion needs verified, finite original and lower sale prices",
    );
  return sale === 0
    ? 100
    : Math.min(99, Math.round(((original - sale) / original) * 100));
}

/** Editorial score v1. Marketplace stars are kept separate from the score. */
export function scoreBreakdown(offer: Promotion) {
  // A small number of ratings should not dominate curation: 10-rating prior.
  const quality =
    offer.rating !== null && offer.reviewCount !== null
      ? (offer.rating * offer.reviewCount + offer.curation.quality * 10) /
        (offer.reviewCount + 10)
      : offer.curation.quality;
  return {
    quality: Math.round((quality / 5) * 25),
    value: Math.round((offer.curation.value / 5) * 20),
    discount: Math.round(
      (calculateDiscount(offer.originalPrice, offer.salePrice) / 100) * 15,
    ),
    completeness: Math.round((offer.curation.completeness / 5) * 10),
    license: offer.commercialUse ? 20 : 0,
    reputation: Math.round((offer.curation.reputation / 5) * 10),
  };
}

export function calculateRadarScore(offer: Promotion): number {
  return Math.max(
    0,
    Math.min(
      100,
      Object.values(scoreBreakdown(offer)).reduce((sum, n) => sum + n, 0),
    ),
  );
}

export function calculateFreeScore(
  asset: Pick<Asset, "formats" | "fileCount" | "commercialUse">,
): number {
  // Unrated free packs get neutral quality, full free value, known format breadth
  // and verified commercial rights. No marketplace rating is invented.
  return (
    18 +
    20 +
    15 +
    (asset.formats.length > 1 ? 8 : 6) +
    (asset.fileCount ? 2 : 0) +
    (asset.commercialUse ? 20 : 0) +
    10
  );
}

export function offerStatus(
  offer: Pick<Promotion, "expiresAt" | "lastChecked">,
  now: number,
): "active" | "expired" | "verification_required" {
  if (offer.expiresAt && Date.parse(offer.expiresAt) <= now) return "expired";
  const checked = Date.parse(offer.lastChecked);
  if (
    !Number.isFinite(checked) ||
    checked > now ||
    now >= checked + OFFER_FRESHNESS_MS
  )
    return "verification_required";
  if (offer.expiresAt && !Number.isFinite(Date.parse(offer.expiresAt)))
    return "verification_required";
  return "active";
}

export function offerDeadline(
  offer: Pick<Promotion, "expiresAt" | "lastChecked">,
): number {
  return Math.min(
    offer.expiresAt ? Date.parse(offer.expiresAt) : Infinity,
    Date.parse(offer.lastChecked) + OFFER_FRESHNESS_MS,
  );
}

export function formatPrice(price: number, currency: string): string {
  const minorUnits = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(price) ? 0 : minorUnits,
    maximumFractionDigits: Math.max(minorUnits ?? 2, 2),
  }).format(price);
}

export function formatCountdown(expiresAt: string, now: number): string {
  const minutes = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 60000));
  if (!minutes) return "Ended";
  const days = Math.floor(minutes / 1440),
    hours = Math.floor((minutes % 1440) / 60);
  return days
    ? `${days}d ${hours}h left`
    : hours
      ? `${hours}h ${minutes % 60}m left`
      : `${minutes}m left`;
}
