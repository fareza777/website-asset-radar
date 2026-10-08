import { parseLibrary } from "./catalog-utils";
import type { PersonalCollection } from "./types";

export const LIBRARY_KEY = "assetradar-library-v1";
type Snapshot = {
  favorites: string[];
  collections: PersonalCollection[];
  ready: boolean;
  storageError: boolean;
};
const serverSnapshot: Snapshot = {
  favorites: [],
  collections: [],
  ready: false,
  storageError: false,
};

export function createLibraryStore(ids: Set<string>) {
  let cached: Snapshot | undefined;
  const listeners = new Set<() => void>();
  function getSnapshot(): Snapshot {
    if (cached) return cached;
    try {
      const raw = localStorage.getItem(LIBRARY_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      cached = {
        ...parseLibrary(parsed, ids),
        ready: true,
        storageError: false,
      };
    } catch {
      cached = { ...serverSnapshot, ready: true, storageError: true };
    }
    return cached;
  }
  function emit() {
    listeners.forEach((listener) => listener());
  }
  function handleStorage(event: StorageEvent) {
    if (event.key === LIBRARY_KEY || event.key === null) {
      cached = undefined;
      emit();
    }
  }
  function update(next: {
    favorites: string[];
    collections: PersonalCollection[];
  }) {
    let storageError = false;
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
    } catch {
      storageError = true;
    }
    cached = { ...next, ready: true, storageError };
    emit();
  }
  return {
    getSnapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener: () => void) {
      if (listeners.size === 0)
        window.addEventListener("storage", handleStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0)
          window.removeEventListener("storage", handleStorage);
      };
    },
    toggleFavorite(id: string) {
      if (!ids.has(id)) return false;
      const state = getSnapshot();
      const isSaved = !state.favorites.includes(id);
      update({
        favorites: isSaved
          ? [...state.favorites, id]
          : state.favorites.filter((x) => x !== id),
        collections: state.collections,
      });
      return isSaved;
    },
    createCollection(name: string) {
      const state = getSnapshot();
      if (!name.trim() || state.collections.length >= 100) return null;
      const collection = {
        id: crypto.randomUUID(),
        name: name.trim().slice(0, 60),
        assetIds: [],
      };
      update({
        favorites: state.favorites,
        collections: [...state.collections, collection],
      });
      return collection.id;
    },
    toggleInCollection(collectionId: string, assetId: string) {
      if (!ids.has(assetId)) return;
      const state = getSnapshot();
      update({
        favorites: state.favorites,
        collections: state.collections.map((c) =>
          c.id !== collectionId
            ? c
            : {
                ...c,
                assetIds: c.assetIds.includes(assetId)
                  ? c.assetIds.filter((x) => x !== assetId)
                  : [...c.assetIds, assetId],
              },
        ),
      });
    },
    deleteCollection(id: string) {
      const state = getSnapshot();
      update({
        favorites: state.favorites,
        collections: state.collections.filter((c) => c.id !== id),
      });
    },
  };
}
