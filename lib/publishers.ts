import data from "@/data/publishers.json";
import type { DirectoryAsset } from "./types";

export type Publisher = (typeof data)[number];
export const publishers: Publisher[] = data;
export const getPublisher = (id: string) => publishers.find((publisher) => publisher.id === id);
/** Exact credited identity only; a product title mentioning a brand is insufficient. */
export function publisherForAsset(asset: Pick<DirectoryAsset, "author">) {
  return publishers.find((publisher) => publisher.aliases.some((alias) => alias.toLowerCase() === asset.author.toLowerCase()));
}
export function matchesPublisher(asset: Pick<DirectoryAsset, "author">, value: string) {
  const publisher = publisherForAsset(asset);
  return value === "All" || publisher?.id === value || asset.author === value;
}
