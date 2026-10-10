"use client";
import { useCallback, useSyncExternalStore } from "react";
import { offerDeadline } from "./offer-utils";
import type { Promotion } from "./types";

let snapshot: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
const deadlines = new Map<() => void, number[]>();
function tick() {
  snapshot = Date.now();
  listeners.forEach((listener) => listener());
  const future = [...deadlines.values()]
    .flat()
    .filter((value) => value > snapshot!);
  timer = future.length
    ? setTimeout(
        tick,
        Math.min(60000, Math.max(100, Math.min(...future) - snapshot)),
      )
    : undefined;
}
const serverSnapshot = () => null;
const getSnapshot = () => snapshot;
export function useOfferClock(offers: Pick<Promotion, "expiresAt" | "lastChecked">[]) {
  const signature = offers.map(offerDeadline).join(",");
  const subscribe = useCallback(
    (listener: () => void) => {
      if (!signature) return () => {};
      listeners.add(listener);
      deadlines.set(listener, signature.split(",").map(Number));
      if (timer) clearTimeout(timer);
      tick();
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          if (timer) clearTimeout(timer);
          tick();
        }
      };
      document.addEventListener("visibilitychange", onVisible);
      return () => {
        listeners.delete(listener);
        deadlines.delete(listener);
        document.removeEventListener("visibilitychange", onVisible);
        if (!listeners.size && timer) {
          clearTimeout(timer);
          timer = undefined;
        }
      };
    },
    [signature],
  );
  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}
