import type { MetadataRoute } from "next";
import { assets, collections } from "@/lib/catalog";
import { categories } from "@/lib/types";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastChecked = assets
    .map((a) => a.verifiedAt)
    .sort()
    .at(-1);
  return [
    ...["", "/latest", "/cc0", "/collections", "/about", "/licenses"].map(
      (path) => ({
        url: `${siteUrl}${path}/`,
        lastModified: lastChecked,
        changeFrequency: "weekly" as const,
        priority: path ? 0.7 : 1,
      }),
    ),
    ...categories.map((c) => ({
      url: `${siteUrl}/categories/${c.toLowerCase()}/`,
      lastModified: lastChecked,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...collections.map((c) => ({
      url: `${siteUrl}/collections/${c.id}/`,
      lastModified: lastChecked,
      priority: 0.7,
    })),
    ...assets.map((a) => ({
      url: `${siteUrl}/assets/${a.id}/`,
      lastModified: a.verifiedAt,
      priority: 0.8,
    })),
  ];
}
