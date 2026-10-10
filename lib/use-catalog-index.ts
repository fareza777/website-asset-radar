"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { CatalogIndex } from "./catalog-discovery";

type Snapshot = { data?: CatalogIndex; loading: boolean; error: boolean };
const empty: Snapshot = { loading: false, error: false };
const cache = new Map<
  string,
  { snapshot: Snapshot; pending?: Promise<void>; listeners: Set<() => void> }
>();

function entry(url: string) {
  let value = cache.get(url);
  if (!value) {
    value = { snapshot: empty, listeners: new Set() };
    cache.set(url, value);
  }
  return value;
}

function loadIndex(url: string) {
  const item = entry(url);
  if (item.snapshot.data || item.pending) return item.pending;
  const update = (snapshot: Snapshot) => {
    item.snapshot = snapshot;
    item.listeners.forEach((listener) => listener());
  };
  update({ loading: true, error: false });
  item.pending = fetch(url, { signal: AbortSignal.timeout(20000) })
    .then(async (response) => {
      if (!response.ok) throw new Error("Catalog unavailable");
      const data = (await response.json()) as CatalogIndex;
      if (
        data.version !== 1 ||
        !Array.isArray(data.assets) ||
        !Array.isArray(data.archivedIds)
      ) {
        throw new Error("Unsupported catalog index");
      }
      update({ data, loading: false, error: false });
    })
    .catch(() => update({ loading: false, error: true }))
    .finally(() => {
      item.pending = undefined;
    });
  return item.pending;
}

/** One request shared by galleries across navigation; initial cards stay in HTML. */
export function useCatalogIndex(url?: string) {
  const subscribe = useCallback(
    (listener: () => void) => {
      if (!url) return () => {};
      const item = entry(url);
      item.listeners.add(listener);
      return () => {
        item.listeners.delete(listener);
      };
    },
    [url],
  );
  const getSnapshot = useCallback(
    () => (url ? entry(url).snapshot : empty),
    [url],
  );
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => empty);
  useEffect(() => {
    if (url) void loadIndex(url);
  }, [url]);
  const retry = useCallback(() => {
    if (url) void loadIndex(url);
  }, [url]);
  return { ...snapshot, retry };
}
