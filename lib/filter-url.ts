import { defaultFilters, type Filters } from "./types";

const choices = {
  sort: ["curated", "latest", "name", "quality", "discount", "deal"],
  type: ["All", "free", "limited_free", "deal"],
  discount: ["All", "30", "50", "70"],
  compatibility: ["All", "Native", "Importable", "Unverified"],
} as const;
export function parseFilterUrl(search: string, initial: Partial<Filters> = {}): Filters {
  const filters = { ...defaultFilters, ...initial };
  const params = new URLSearchParams(search);
  for (const key of Object.keys(defaultFilters) as (keyof Filters)[]) {
    const value = params.get(key);
    if (value === null || value.length > 200) continue;
    if (key in choices && !(choices[key as keyof typeof choices] as readonly string[]).includes(value)) continue;
    (filters as Record<string, string>)[key] = value;
  }
  return filters;
}
export function serializeFilterUrl(filters: Filters, initial: Partial<Filters> = {}, existing = "") {
  const defaults = { ...defaultFilters, ...initial };
  const params = new URLSearchParams(existing);
  for (const key of Object.keys(defaultFilters) as (keyof Filters)[]) {
    params.delete(key);
    if (filters[key] !== defaults[key]) params.set(key, filters[key]);
  }
  params.sort();
  return params.toString();
}
export const filterLabels: Record<keyof Filters, string> = {
  query: "Search", category: "Genre", dimension: "Dimension", assetType: "Asset type",
  engine: "Engine", license: "License", source: "Marketplace", publisher: "Publisher",
  format: "Format", type: "Availability", discount: "Discount", compatibility: "Compatibility", sort: "Sort",
};
