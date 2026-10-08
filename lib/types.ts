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
] as const;
export type AssetType = (typeof assetTypes)[number];
export type Asset = {
  id: string;
  title: string;
  author: string;
  authors?: string[];
  summary: string;
  categories: Category[];
  dimension: "2D" | "3D" | "Audio";
  assetType: AssetType;
  source: "Kenney" | "Poly Haven";
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
  sort: "curated" | "latest" | "name";
};

export const defaultFilters: Filters = {
  query: "",
  category: "All",
  dimension: "All",
  assetType: "All",
  engine: "All",
  license: "All",
  source: "All",
  sort: "curated",
};
