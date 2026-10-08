import { Hero } from "@/components/hero";
import { AssetGallery } from "@/components/asset-gallery";
import { CollectionsPreview } from "@/components/collections-preview";
import { assets } from "@/lib/catalog";
import { siteUrl, jsonLd } from "@/lib/site";

export default function Home() {
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
      <AssetGallery assets={assets} />
      <CollectionsPreview />
    </>
  );
}
