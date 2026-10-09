import { Hero } from "@/components/hero";
import {
  HomeSearch,
  FreeDiscoverySection,
  CategoryDiscovery,
} from "@/components/home-discovery";
import { PromotionSection } from "@/components/promotion-section";
import { CollectionsPreview } from "@/components/collections-preview";
import { TodaysRadar } from "@/components/todays-radar";
import { FeaturedPublishers } from "@/components/featured-publishers";
import { assets, offers } from "@/lib/catalog";
import { filterAssets } from "@/lib/catalog-utils";
import { defaultFilters } from "@/lib/types";
import { siteName, siteUrl, jsonLd } from "@/lib/site";

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
            name: siteName,
            url: siteUrl,
            description:
              "A curated directory of free game assets, limited-time free packs and verified worthwhile discounts.",
          }),
        }}
      />
      <div className="homepage-opening"><Hero /><HomeSearch /></div>
      <TodaysRadar free={assets.find((asset) => asset.id === "kenney-platformer-kit") ?? assets[0]} offers={offers} />
      <FreeDiscoverySection assets={featured} />
      <PromotionSection offers={offers} type="limited_free" />
      <PromotionSection offers={offers} type="deal" />
      <FeaturedPublishers />
      <FreeDiscoverySection
        assets={filterAssets(assets, { ...defaultFilters, sort: "latest" })}
        latest
      />
      <CategoryDiscovery />
      <CollectionsPreview />
    </>
  );
}
