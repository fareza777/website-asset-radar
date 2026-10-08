import type { Metadata } from "next";
import type { DirectoryAsset } from "./types";
import { jsonLd, siteUrl } from "./site";

export function directoryMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | AssetRadar`,
      description,
      url: path,
      type: "website",
      images: [
        {
          url: "/og.jpg",
          width: 1200,
          height: 630,
          alt: "AssetRadar curated game asset directory",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AssetRadar`,
      description,
      images: ["/og.jpg"],
    },
  };
}

export function DirectorySchema({
  title,
  path,
  assets,
}: {
  title: string;
  path: string;
  assets: DirectoryAsset[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          url: `${siteUrl}${path}`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: assets.length,
            itemListElement: assets.map((asset, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: asset.title,
              url: `${siteUrl}/asset/${asset.id}/`,
            })),
          },
        }),
      }}
    />
  );
}

export function AssetBreadcrumb({
  title,
  id,
  type,
}: {
  title: string;
  id: string;
  type: DirectoryAsset["type"];
}) {
  const path =
    type === "limited_free"
      ? "/free-today/"
      : type === "deal"
        ? "/deals/"
        : "/free/";
  const name =
    type === "limited_free"
      ? "Free Today"
      : type === "deal"
        ? "Deals"
        : "Free Assets";
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "AssetRadar",
              item: `${siteUrl}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name,
              item: `${siteUrl}${path}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: `${siteUrl}/asset/${id}/`,
            },
          ],
        }),
      }}
    />
  );
}
