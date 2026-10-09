export const categories = [
  "RPG",
  "Idle",
  "Survival",
  "Platformer",
  "UI",
  "Audio",
  "3D",
] as const;
export type Category = (typeof categories)[number];
export const assetTypes = [
  "Tilesets",
  "3D Models",
  "UI Kits",
  "Icons",
  "Sound Effects",
  "Music",
  "Textures",
  "Environments",
  "Tools & Plugins",
  "Characters",
  "VFX",
] as const;
export type AssetType = (typeof assetTypes)[number];
export type Asset = {
  type: "free";
  originalPrice: null;
  salePrice: 0;
  discountPercent: null;
  currency: null;
  expiresAt: null;
  rating: null;
  reviewCount: null;
  radarScore: number;
  /** Quality only; discounts never increase Radar Score. */
  dealScore: null;
  commercialUse: boolean;
  lastChecked: string;
  id: string;
  title: string;
  author: string;
  authors?: string[];
  summary: string;
  categories: Category[];
  dimension: "2D" | "3D" | "Audio";
  assetType: AssetType;
  source: "Kenney" | "Poly Haven" | "ambientCG";
  sourceUrl: string;
  license: "CC0" | "CC-BY-4.0";
  licenseUrl: string;
  verificationUrl: string;
  verifiedAt: string;
  addedAt: string;
  evidence: string;
  evidenceSha256: string;
  formats: string[];
  engines: string[];
  engineNote: string;
  tags: string[];
  fileCount?: number;
  preview: string;
  audioPreview?: string;
  previewProvenance: {
    url: string;
    file: string;
    license: string;
    sha256: string;
    note: string;
  };
  featured?: boolean;
};

export type Promotion = Omit<
  Asset,
  | "type"
  | "originalPrice"
  | "salePrice"
  | "discountPercent"
  | "currency"
  | "expiresAt"
  | "rating"
  | "reviewCount"
  | "dealScore"
  | "source"
  | "license"
  | "preview"
  | "verifiedAt"
  | "evidence"
  | "evidenceSha256"
  | "verificationUrl"
  | "previewProvenance"
> & {
  type: "limited_free" | "deal";
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  expiresAt: string | null;
  rating: number | null;
  /** Marketplace rating count; not a claim that these are written reviews. */
  reviewCount: number | null;
  /** Value of the verified promotion, separate from asset quality. */
  dealScore: number;
  source:
    | "Fab"
    | "Unity Asset Store"
    | "itch.io"
    | "GameDev Market"
    | "Kenney"
    | "OpenGameArt";
  canonicalSourceUrl: string;
  license: string;
  licenseNote: string;
  licenseTier: string | null;
  priceNote: string;
  preview: string | null;
  /** Public publisher-hosted preview; not a license to copy the asset pack. */
  publisherPreview?: {
    url: string;
    sourceUrl: string;
    alt: string;
    credit: string;
    checkedAt: string;
    note: string;
  };
  thumbnailPermission: {
    permissionUrl: string;
    license: string;
    note: string;
  } | null;
  curation: {
    quality: number;
    value: number;
    completeness: number;
    reputation: number;
    rationale: string;
  };
};
export type DirectoryAsset = Asset | Promotion;
export type OfferEvidence = {
  id: string;
  sourceUrl: string;
  checkedAt: string;
  method: "browser" | "permitted-fetch";
  httpStatus: 200;
  price: {
    originalPrice: number;
    salePrice: number;
    currency: string;
    licenseTier: string | null;
    note: string;
  };
  license: { name: string; url: string; commercialUse: boolean; note: string };
  expiresAt: string | null;
  expiryEvidenceUrl: string | null;
  expiryNote: string | null;
  rating: number | null;
  reviewCount: number | null;
  productNote: string;
};
export type ArchivedOffer = {
  offer: Promotion;
  reason: "expired" | "verification_required";
  archivedAt: string;
};

export type Collection = {
  id: string;
  name: string;
  description: string;
  assetIds: string[];
  cover: string;
  color: string;
};

export type PersonalCollection = {
  id: string;
  name: string;
  assetIds: string[];
};

export type Filters = {
  query: string;
  category: string;
  dimension: string;
  assetType: string;
  engine: string;
  license: string;
  source: string;
  publisher: string;
  format: string;
  type: "All" | "free" | "limited_free" | "deal";
  discount: "All" | "30" | "50" | "70";
  compatibility: "All" | "Native" | "Importable" | "Unverified";
  sort: "curated" | "latest" | "name" | "quality" | "discount" | "deal";
};

export const defaultFilters: Filters = {
  query: "",
  category: "All",
  dimension: "All",
  assetType: "All",
  engine: "All",
  license: "All",
  source: "All",
  publisher: "All",
  format: "All",
  type: "All",
  discount: "All",
  compatibility: "All",
  sort: "curated",
};
