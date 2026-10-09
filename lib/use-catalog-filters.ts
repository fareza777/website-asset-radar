"use client";

import { useSyncExternalStore } from "react";
import { defaultFilters, type Filters } from "./types";
import { parseFilterUrl, serializeFilterUrl } from "./filter-url";

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
  const filters = parseFilterUrl(search, initial);
  function update(patch: Partial<Filters>, reset = false) {
    const next = reset ? defaults : { ...filters, ...patch };
    const encoded = serializeFilterUrl(next, initial, params.toString());
    const method = !reset && Object.keys(patch).every((key) => key === "query") ? "replaceState" : "pushState";
    const target = `${window.location.pathname}${encoded ? `?${encoded}` : ""}${window.location.hash}`;
    if (target === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
    window.history[method](
      window.history.state,
      "",
      target,
    );
    window.dispatchEvent(new Event(eventName));
  }
  return { filters, defaults, update, search };
}
