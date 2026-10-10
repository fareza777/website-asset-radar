import type { Metadata } from "next";
import { defaultFilters, type DirectoryAsset } from "./types";
import { filterAssets } from "./catalog-utils";
import { GALLERY_PAGE_SIZE } from "./catalog-discovery";
import { jsonLd, siteName, siteUrl } from "./site";

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
      title: `${title} | ${siteName}`,
      description,
      url: path,
      type: "website",
      images: [
        {
          url: "/og.jpg",
          width: 1200,
          height: 630,
          alt: `${siteName} curated game asset directory`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
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
            itemListElement: filterAssets(assets, defaultFilters)
              .slice(0, GALLERY_PAGE_SIZE)
              .map((asset, index) => ({
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
              name: siteName,
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
