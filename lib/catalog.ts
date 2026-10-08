import data from "@/data/assets.json";
import collectionData from "@/data/collections.json";
import type { Asset, Collection } from "./types";

export const assets = data as Asset[];
export const collections = collectionData as Collection[];
export const getAsset = (id: string) => assets.find((asset) => asset.id === id);
export const getCollection = (id: string) =>
  collections.find((collection) => collection.id === id);
