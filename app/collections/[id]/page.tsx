import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { assets, collections, getCollection, getAsset } from "@/lib/catalog";
import { AssetGallery } from "@/components/asset-gallery";
import { jsonLd, siteUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return collections.map((c) => ({ id: c.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const collection = getCollection(id);
  return collection
    ? {
        title: collection.name,
        description: collection.description,
        alternates: { canonical: `/collections/${id}/` },
        openGraph: {
          title: `${collection.name} | AssetRadar`,
          description: collection.description,
          url: `/collections/${id}/`,
          images: [getAsset(collection.cover)?.preview ?? "/og.jpg"],
        },
        twitter: {
          card: "summary_large_image",
          title: `${collection.name} | AssetRadar`,
          description: collection.description,
          images: [getAsset(collection.cover)?.preview ?? "/og.jpg"],
        },
      }
    : {};
}
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = getCollection(id);
  if (!collection) notFound();
  const cover = getAsset(collection.cover);
  const items = assets.filter((a) => collection.assetIds.includes(a.id));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: collection.name,
            description: collection.description,
            url: `${siteUrl}/collections/${id}/`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: items.map((a, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${siteUrl}/assets/${a.id}/`,
                name: a.title,
              })),
            },
          }),
        }}
      />
      <Link href="/collections/" className="back-link">
        <ArrowLeft size={17} /> Back to collections
      </Link>
      <div className={`collection-hero ${collection.color}`}>
        <div>
          <span className="intro-category">CURATED COLLECTION</span>
          <h1>{collection.name}</h1>
          <p>{collection.description}</p>
          <span>{items.length} free assets · All licenses verified</span>
        </div>
        {cover && (
          <Image
            src={cover.preview}
            alt={`${collection.name} collection preview`}
            width={800}
            height={450}
            priority
          />
        )}
      </div>
      <AssetGallery
        assets={items}
        heading="Inside this collection"
        showCategories={false}
      />
    </>
  );
}
