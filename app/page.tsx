import { Hero } from "@/components/hero";
import {
  HomeSearch,
  FreeDiscoverySection,
  CategoryDiscovery,
} from "@/components/home-discovery";
import { PromotionSection } from "@/components/promotion-section";
import { CollectionsPreview } from "@/components/collections-preview";
import { assets, offers } from "@/lib/catalog";
import { filterAssets } from "@/lib/catalog-utils";
import { defaultFilters } from "@/lib/types";
import { siteUrl, jsonLd } from "@/lib/site";

export default function Home() {
  const featuredIds = [
    "kenney-nature-kit",
    "kenney-tiny-town",
    "kenney-fantasy-town-kit",
    "kenney-ui-pack-pixel-adventure",
    "kenney-tiny-dungeon",
    "kenney-music-jingles",
  ];
  const featured = featuredIds.flatMap((id) =>
    assets.filter((asset) => asset.id === id),
  );
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "AssetRadar",
            url: siteUrl,
            description:
              "A curated library of free game development assets with verified licenses.",
          }),
        }}
      />
      <Hero />
      <HomeSearch />
      <PromotionSection offers={offers} type="limited_free" />
      <PromotionSection offers={offers} type="deal" />
      <FreeDiscoverySection assets={featured} />
      <FreeDiscoverySection
        assets={filterAssets(assets, { ...defaultFilters, sort: "latest" })}
        latest
      />
      <CategoryDiscovery />
      <CollectionsPreview />
    </>
  );
}
