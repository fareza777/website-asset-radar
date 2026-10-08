import type { Asset } from "./types";
import { calculateFreeScore } from "./offer-utils";

type DiscoveryKeys =
  | "type"
  | "originalPrice"
  | "salePrice"
  | "discountPercent"
  | "currency"
  | "expiresAt"
  | "rating"
  | "reviewCount"
  | "radarScore"
  | "commercialUse"
  | "lastChecked";
export function enrichFreeAsset(
  input: Omit<Asset, DiscoveryKeys>,
  checkedAt: string,
): Asset {
  const asset: Asset = {
    ...input,
    type: "free",
    originalPrice: null,
    salePrice: 0,
    discountPercent: null,
    currency: null,
    expiresAt: null,
    rating: null,
    reviewCount: null,
    radarScore: 0,
    commercialUse: true,
    lastChecked: checkedAt,
  };
  asset.radarScore = calculateFreeScore(asset);
  return asset;
}
