import type { DirectoryAsset, Filters, PersonalCollection } from "./types";

export function filterAssets<T extends DirectoryAsset>(
  assets: T[],
  filters: Filters,
): T[] {
  const terms = filters.query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const result = assets.filter((asset) => {
    const haystack = [
      asset.title,
      asset.author,
      asset.summary,
      asset.source,
      asset.assetType,
      asset.dimension,
      asset.license,
      ...asset.formats,
      ...asset.engines,
      ...asset.tags,
      ...asset.categories,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return (
      terms.every((term) => haystack.includes(term)) &&
      (filters.category === "All" ||
        asset.categories.includes(
          filters.category as DirectoryAsset["categories"][number],
        )) &&
      (filters.dimension === "All" || asset.dimension === filters.dimension) &&
      (filters.assetType === "All" || asset.assetType === filters.assetType) &&
      (filters.engine === "All" || asset.engines.includes(filters.engine)) &&
      (filters.license === "All" || asset.license === filters.license) &&
      (filters.source === "All" || asset.source === filters.source)
    );
  });
  if (filters.sort === "latest")
    return result.sort(
      (a, b) =>
        b.addedAt.localeCompare(a.addedAt) || a.title.localeCompare(b.title),
    );
  if (filters.sort === "name")
    return result.sort((a, b) => a.title.localeCompare(b.title));
  return result.sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );
}

export function canonicalUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Sources must use HTTPS");
  if (url.username || url.password || url.port)
    throw new Error("Source URL must not include credentials or a port");
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$|ref$)/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString();
}

export function parseLibrary(
  value: unknown,
  validIds: Set<string>,
): { favorites: string[]; collections: PersonalCollection[] } {
  if (!value || typeof value !== "object")
    return { favorites: [], collections: [] };
  const raw = value as Record<string, unknown>;
  const ids = (input: unknown) =>
    Array.isArray(input)
      ? [
          ...new Set(
            input.filter(
              (id): id is string => typeof id === "string" && validIds.has(id),
            ),
          ),
        ]
      : [];
  const collections: PersonalCollection[] = [];
  if (Array.isArray(raw.collections)) {
    for (const item of raw.collections.slice(0, 100)) {
      if (!item || typeof item !== "object") continue;
      const { id, name, assetIds } = item as Record<string, unknown>;
      if (
        typeof id !== "string" ||
        !/^[\w-]{1,80}$/.test(id) ||
        collections.some((c) => c.id === id)
      )
        continue;
      if (typeof name !== "string" || !name.trim()) continue;
      collections.push({
        id,
        name: name.trim().slice(0, 60),
        assetIds: ids(assetIds),
      });
    }
  }
  return { favorites: ids(raw.favorites), collections };
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value.includes("T") ? value : `${value}T00:00:00Z`));
}
