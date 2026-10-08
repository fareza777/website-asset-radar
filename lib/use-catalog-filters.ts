"use client";

import { useSyncExternalStore } from "react";
import { defaultFilters, type Filters } from "./types";

const eventName = "assetradar:filters";
function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(eventName, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(eventName, listener);
  };
}
export function useCatalogFilters(initial: Partial<Filters>) {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const defaults = { ...defaultFilters, ...initial };
  const params = new URLSearchParams(search);
  const filters = { ...defaults };
  for (const key of Object.keys(defaultFilters) as (keyof Filters)[]) {
    const value = params.get(key);
    if (value !== null)
      (filters as Record<string, string>)[key] = value.slice(0, 200);
  }
  if (!["curated", "latest", "name"].includes(filters.sort))
    filters.sort = defaults.sort;
  function update(patch: Partial<Filters>, reset = false) {
    const next = reset ? defaults : { ...filters, ...patch };
    const query = new URLSearchParams();
    for (const key of Object.keys(defaultFilters) as (keyof Filters)[]) {
      if (next[key] !== defaults[key]) query.set(key, next[key]);
    }
    // Preserve personal collection selectors and unrelated URL state.
    for (const [key, value] of params)
      if (!(key in defaultFilters)) query.set(key, value);
    const encoded = query.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${encoded ? `?${encoded}` : ""}${window.location.hash}`,
    );
    window.dispatchEvent(new Event(eventName));
  }
  return { filters, defaults, update };
}
