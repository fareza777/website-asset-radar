"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";

type MotionState = "enabled" | "paused" | "reduced";
const key = "assetradar-motion";
const eventName = "assetradar-motion-change";
let sessionPreference: string | null = null;

function snapshot(): MotionState {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return "reduced";
  let preference = sessionPreference;
  try {
    preference = window.localStorage.getItem(key) ?? preference;
  } catch {
    /* Session preference still works. */
  }
  return preference === "paused" ? "paused" : "enabled";
}
const serverSnapshot = (): MotionState => "paused";
function subscribe(listener: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  window.addEventListener("storage", listener);
  window.addEventListener(eventName, listener);
  return () => {
    media.removeEventListener("change", listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener(eventName, listener);
  };
}
function toggle() {
  if (snapshot() === "reduced") return;
  sessionPreference = snapshot() === "enabled" ? "paused" : "enabled";
  try {
    window.localStorage.setItem(key, sessionPreference);
  } catch {
    /* Retain choice for this session. */
  }
  window.dispatchEvent(new Event(eventName));
}
const MotionContext = createContext<{ state: MotionState; toggle: () => void }>(
  { state: "paused", toggle },
);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motionEnabled = String(state === "enabled");
    const surfaces = new Set<HTMLElement>();
    const visible = new Set<HTMLElement>();
    const update = () =>
      surfaces.forEach((surface) => {
        surface.dataset.motion =
          state === "enabled" && !document.hidden && visible.has(surface)
            ? "running"
            : "paused";
      });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
          else visible.delete(entry.target as HTMLElement);
        });
        update();
      },
      { threshold: 0.05 },
    );
    const syncSurfaces = () => {
      const current = new Set(
        document.querySelectorAll<HTMLElement>(".motion-surface"),
      );
      surfaces.forEach((surface) => {
        if (!current.has(surface)) {
          observer.unobserve(surface);
          visible.delete(surface);
          surfaces.delete(surface);
        }
      });
      current.forEach((surface) => {
        if (!surfaces.has(surface)) {
          surfaces.add(surface);
          observer.observe(surface);
        }
      });
      update();
    };
    const mutations = new MutationObserver((records) => {
      const changed = records.some((record) =>
        [...record.addedNodes, ...record.removedNodes].some(
          (node) =>
            node instanceof Element &&
            (node.matches(".motion-surface") ||
              node.querySelector(".motion-surface")),
        ),
      );
      if (changed) syncSurfaces();
    });
    syncSurfaces();
    mutations.observe(root, { childList: true, subtree: true });
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      document.removeEventListener("visibilitychange", update);
      surfaces.forEach((surface) => {
        surface.dataset.motion = "paused";
      });
    };
  }, [state, path]);
  return (
    <MotionContext.Provider value={{ state, toggle }}>
      {children}
    </MotionContext.Provider>
  );
}
export const useMotion = () => useContext(MotionContext);
