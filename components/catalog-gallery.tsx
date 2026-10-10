import type { ComponentProps } from "react";
import type { DirectoryAsset } from "@/lib/types";
import { defaultFilters } from "@/lib/types";
import { filterAssets } from "@/lib/catalog-utils";
import { toCardAsset, type CatalogScope } from "@/lib/catalog-card";
import { catalogFacets, GALLERY_PAGE_SIZE } from "@/lib/catalog-discovery";
import { catalogIndexUrl } from "@/lib/generated/catalog";
import { AssetGallery as ClientGallery } from "./asset-gallery";

// Only the first page crosses the React server/client boundary. The complete
// search index is a single static, content-addressed file shared by every route.
export function AssetGallery({
  assets,
  scope,
  ...props
}: Omit<
  ComponentProps<typeof ClientGallery>,
  "assets" | "catalogUrl" | "initialCount" | "initialFacets" | "scope"
> & {
  assets: DirectoryAsset[];
  scope?: CatalogScope;
}) {
  const cards = assets.map(toCardAsset);
  const selectedScope = scope ?? { ids: assets.map((asset) => asset.id) };
  const initial = props.favoritesOnly
    ? []
    : filterAssets(cards, { ...defaultFilters, ...props.initialFilters });
  return (
    <ClientGallery
      {...props}
      assets={initial.slice(0, GALLERY_PAGE_SIZE)}
      initialCount={initial.length}
      initialFacets={catalogFacets(cards)}
      catalogUrl={catalogIndexUrl}
      scope={selectedScope}
    />
  );
}
