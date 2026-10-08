"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  useEffect,
} from "react";
import {
  CheckCircle as CheckCircleIcon,
  X as XIcon,
  WarningCircle as WarningCircleIcon,
} from "@phosphor-icons/react";
import { createLibraryStore } from "@/lib/library-store";

type Store = ReturnType<typeof createLibraryStore>;
type Context = ReturnType<Store["getSnapshot"]> &
  Omit<Store, "getSnapshot" | "getServerSnapshot" | "subscribe"> & {
    notify: (message: string) => void;
  };
const LibraryContext = createContext<Context | null>(null);

export function LibraryProvider({
  ids,
  children,
}: {
  ids: string[];
  children: React.ReactNode;
}) {
  const [store] = useState(() => createLibraryStore(new Set(ids)));
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  return (
    <LibraryContext.Provider
      value={{
        ...snapshot,
        toggleFavorite: store.toggleFavorite,
        createCollection: store.createCollection,
        toggleInCollection: store.toggleInCollection,
        deleteCollection: store.deleteCollection,
        notify: setToast,
      }}
    >
      {children}
      {snapshot.storageError && (
        <div className="storage-notice" role="status">
          <WarningCircleIcon size={17} /> Browser storage is unavailable. Your
          library will last for this session.
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircleIcon weight="fill" size={20} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <XIcon size={16} />
          </button>
        </div>
      )}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("LibraryProvider is required");
  return context;
}
