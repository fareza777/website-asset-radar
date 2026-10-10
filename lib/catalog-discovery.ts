import type { CardAsset, CatalogScope } from "./catalog-card";
import { matchesPublisher, publisherForAsset } from "./publishers";

export const GALLERY_PAGE_SIZE = 12;
export type CatalogIndex = {
  version: 1;
  assets: CardAsset[];
  archivedIds: string[];
};
export type CatalogFacets = {
  authors: string[];
  kinds: CardAsset["type"][];
  engines: string[];
  assetTypes: string[];
  licenses: string[];
  formats: string[];
  sources: string[];
};

export function catalogFacets(assets: CardAsset[]): CatalogFacets {
  const unique = (values: string[]) => [...new Set(values)].sort();
  return {
    authors: unique(
      assets
        .filter((asset) => !publisherForAsset(asset))
        .map((asset) => asset.author),
    ),
    kinds: [...new Set(assets.map((asset) => asset.type))],
    engines: unique(assets.flatMap((asset) => asset.engines)),
    assetTypes: unique(assets.map((asset) => asset.assetType)),
    licenses: unique(assets.map((asset) => asset.license)),
    formats: unique(assets.flatMap((asset) => asset.formats)),
    sources: unique(assets.map((asset) => asset.source)),
  };
}

export function scopeCatalogAssets<T extends CardAsset>(
  assets: T[],
  scope: CatalogScope = {},
  archivedIds: string[] = [],
): T[] {
  const archived = new Set(archivedIds);
  const ids = scope.ids ? new Set(scope.ids) : null;
  const items = assets.filter(
    (asset) =>
      (scope.includeArchived || !archived.has(asset.id)) &&
      (!ids || ids.has(asset.id)) &&
      (!scope.type || asset.type === scope.type) &&
      (!scope.category ||
        asset.categories.some((category) => category === scope.category)) &&
      (!scope.license || asset.license === scope.license) &&
      (!scope.publisher || matchesPublisher(asset, scope.publisher)),
  );
  if (!scope.ids) return items;
  // Curated and personal collections keep their own member order.
  const byId = new Map(items.map((asset) => [asset.id, asset]));
  return [...new Set(scope.ids)].flatMap((id) =>
    byId.has(id) ? [byId.get(id)!] : [],
  );
}
