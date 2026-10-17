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
import { HomeTicker, type TickerOffer } from "@/components/home-ticker";
import { assets, offers } from "@/lib/catalog";
import { filterAssets } from "@/lib/catalog-utils";
import { categories, defaultFilters } from "@/lib/types";
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
  const latest = filterAssets(assets, { ...defaultFilters, sort: "latest" });
  const tickerOffers: TickerOffer[] = offers.map(
    ({ id, title, type, discountPercent, source, expiresAt, lastChecked }) => ({
      id, title, type, discountPercent, source, expiresAt, lastChecked,
    }),
  );
  const worlds = categories.map((name) => ({
    name,
    count: assets.filter((asset) => asset.categories.includes(name)).length,
  }));
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
      <div className="homepage-opening">
        <Hero
          freeCount={assets.length}
          creatorCount={new Set(assets.map((asset) => asset.author)).size}
          offers={tickerOffers}
        />
        <HomeSearch />
      </div>
      <HomeTicker
        latest={latest.slice(0, 16).map(({ id, title, author, license }) => ({ id, title, author, license }))}
        offers={tickerOffers}
        worlds={worlds}
      />
      <TodaysRadar free={assets.find((asset) => asset.id === "kenney-platformer-kit") ?? assets[0]} offers={offers} />
      <FreeDiscoverySection assets={featured} />
      <PromotionSection offers={offers} type="limited_free" />
      <PromotionSection offers={offers} type="deal" />
      <FeaturedPublishers />
      <FreeDiscoverySection assets={latest} latest />
      <CategoryDiscovery />
      <CollectionsPreview />
    </>
  );
}
