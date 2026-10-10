import type { Asset, DirectoryAsset, Promotion } from "./types";

// Gallery data deliberately excludes download evidence and preview provenance.
// The complete, verified records remain in the catalog and on asset detail pages.
const commonFields = [
  "id",
  "type",
  "title",
  "author",
  "summary",
  "categories",
  "dimension",
  "assetType",
  "source",
  "sourceUrl",
  "license",
  "commercialUse",
  "lastChecked",
  "originalPrice",
  "salePrice",
  "discountPercent",
  "currency",
  "expiresAt",
  "rating",
  "reviewCount",
  "radarScore",
  "dealScore",
  "formats",
  "engines",
  "engineNote",
  "tags",
  "addedAt",
  "preview",
  "featured",
] as const;
const freeFields = [...commonFields, "verificationUrl"] as const;
const promotionFields = [
  ...commonFields,
  "canonicalSourceUrl",
  "licenseNote",
  "licenseTier",
  "publisherPreview",
  "thumbnailPermission",
] as const;

export type CardFreeAsset = Pick<Asset, (typeof freeFields)[number]>;
export type CardPromotion = Pick<Promotion, (typeof promotionFields)[number]>;
export type CardAsset = CardFreeAsset | CardPromotion;

export function toCardAsset(asset: Asset): CardFreeAsset;
export function toCardAsset(asset: Promotion): CardPromotion;
export function toCardAsset(asset: DirectoryAsset): CardAsset;
export function toCardAsset(asset: DirectoryAsset): CardAsset {
  const fields = asset.type === "free" ? freeFields : promotionFields;
  return Object.fromEntries(
    fields.map((key) => [key, asset[key as keyof typeof asset]]),
  ) as CardAsset;
}

export type CatalogScope = {
  type?: CardAsset["type"];
  category?: string;
  license?: string;
  publisher?: string;
  ids?: string[];
  includeArchived?: boolean;
};
