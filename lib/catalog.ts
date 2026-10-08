import data from "@/data/assets.json";
import collectionData from "@/data/collections.json";
import offerData from "@/data/offers.json";
import archiveData from "@/data/offer-archive.json";
import type {
  Asset,
  Collection,
  Promotion,
  ArchivedOffer,
  DirectoryAsset,
} from "./types";

export const assets = data as Asset[];
export const collections = collectionData as Collection[];
export const offers = offerData as Promotion[];
export const archivedOffers = archiveData as ArchivedOffer[];
export const directoryAssets: DirectoryAsset[] = [
  ...assets,
  ...offers,
  ...archivedOffers.map((item) => item.offer),
];
export const getDirectoryAsset = (id: string) =>
  directoryAssets.find((asset) => asset.id === id);
export const getAsset = (id: string) => assets.find((asset) => asset.id === id);
export const getCollection = (id: string) =>
  collections.find((collection) => collection.id === id);
