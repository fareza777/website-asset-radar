import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssetGallery } from "@/components/asset-gallery";
import { assets } from "@/lib/catalog";
import { categories } from "@/lib/types";
import { jsonLd, siteUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map((category) => ({ category: category.toLowerCase() }));
}
const descriptions: Record<string, string> = {
  RPG: "Build your next quest with free dungeon tiles, fantasy models, characters, and RPG interfaces.",
  Idle: "Free assets for cozy towns, incremental adventures, and games that grow a little at a time.",
  Survival:
    "Build a world worth exploring with free environment models, outdoor props, and textures.",
  Platformer:
    "Give your next platformer a running start with free pixel-art terrain, characters, and level tiles.",
  UI: "The details that make a game feel finished. Free interfaces, input prompts, icons, and menu elements.",
  Audio:
    "Bring your game to life with free sound effects, interface sounds, and short music jingles.",
  "3D": "From a first blockout to a colorful world. Free 3D models and textures with verified licenses.",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name = categories.find((c) => c.toLowerCase() === category);
  if (!name) return {};
  return {
    title: `Free ${name} game assets`,
    description: descriptions[name],
    alternates: { canonical: `/category/${category}/` },
    openGraph: {
      title: `Free ${name} game assets | Game Asset Radar`,
      description: descriptions[name],
      url: `/category/${category}/`,
      images: ["/og.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: `Free ${name} game assets | Game Asset Radar`,
      description: descriptions[name],
      images: ["/og.jpg"],
    },
  };
}
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const name = categories.find((c) => c.toLowerCase() === category);
  if (!name) notFound();
  const items = assets.filter((a) => a.categories.includes(name));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Free ${name} game assets`,
            url: `${siteUrl}/category/${category}/`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: items.map((a, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${siteUrl}/asset/${a.id}/`,
                name: a.title,
              })),
            },
          }),
        }}
      />
      <div className="page-intro">
        <span className="intro-category">EXPLORE {name.toUpperCase()}</span>
        <h1>
          {name === "Audio"
            ? "Find your game's sound."
            : name === "UI"
              ? "Every detail makes a difference."
              : `A world of ${name} possibilities.`}
        </h1>
        <p>{descriptions[name]}</p>
      </div>
      <AssetGallery
        assets={items}
        initialFilters={{ category: name }}
        heading={`${name} assets`}
        showCategories={false}
      />
    </>
  );
}
