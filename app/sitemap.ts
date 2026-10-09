import type { MetadataRoute } from "next";
import { directoryAssets, collections } from "@/lib/catalog";
import { categories } from "@/lib/types";
import { siteUrl } from "@/lib/site";
import { publishers } from "@/lib/publishers";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastChecked = directoryAssets
    .map((a) => a.lastChecked)
    .sort()
    .at(-1);
  const lastCollectionUpdate = collections
    .map((collection) => collection.updatedAt)
    .sort()
    .at(-1);
  const lastContentUpdate = [lastChecked, lastCollectionUpdate]
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);
  return [
    ...[
      "",
      "/free",
      "/free-today",
      "/deals",
      "/latest",
      "/cc0",
      "/collections",
      "/about",
      "/licenses",
      "/explore",
      "/publishers",
    ].map((path) => ({
      url: `${siteUrl}${path}/`,
      lastModified:
        path === "/collections" || path === ""
          ? lastContentUpdate
          : lastChecked,
      changeFrequency:
        path === "/free-today" || path === "/deals"
          ? ("daily" as const)
          : ("weekly" as const),
      priority: path ? 0.7 : 1,
    })),
    ...categories.map((c) => ({
      url: `${siteUrl}/category/${c.toLowerCase()}/`,
      lastModified: lastChecked,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...publishers.map((publisher) => ({
      url: `${siteUrl}/publisher/${publisher.id}/`,
      lastModified: publisher.profileCheckedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...collections.map((c) => ({
      url: `${siteUrl}/collections/${c.id}/`,
      lastModified: c.updatedAt,
      priority: 0.7,
    })),
    ...directoryAssets.map((a) => ({
      url: `${siteUrl}/asset/${a.id}/`,
      lastModified: a.lastChecked,
      priority: 0.8,
    })),
  ];
}
