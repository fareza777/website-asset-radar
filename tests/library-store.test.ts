import test from "node:test";
import assert from "node:assert/strict";
import { createLibraryStore, LIBRARY_KEY } from "../lib/library-store";

test("favorites, collection membership, reloads, cross-tab events and quota failures stay usable", () => {
  const descriptors = new Map(
    ["window", "localStorage"].map((name) => [
      name,
      Object.getOwnPropertyDescriptor(globalThis, name),
    ]),
  );
  const events = new EventTarget();
  const data = new Map<string, string>();
  let unavailable = false;
  const storage = {
    getItem(key: string) {
      if (unavailable) throw new Error("Blocked");
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (unavailable) throw new Error("Quota");
      data.set(key, value);
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: events,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  try {
    const ids = new Set(["one", "two"]);
    const store = createLibraryStore(ids);
    assert.equal(store.getServerSnapshot().ready, false);
    assert.equal(store.toggleFavorite("one"), true);
    assert.equal(store.toggleFavorite("unknown"), false);
    const collection = store.createCollection("  My RPG  ")!;
    store.toggleInCollection(collection, "two");
    const reloaded = createLibraryStore(ids);
    assert.deepEqual(reloaded.getSnapshot().favorites, ["one"]);
    assert.deepEqual(reloaded.getSnapshot().collections[0].assetIds, ["two"]);
    assert.equal(reloaded.getSnapshot().collections[0].name, "My RPG");

    let notifications = 0;
    const unsubscribe = reloaded.subscribe(() => {
      notifications++;
    });
    storage.setItem(
      LIBRARY_KEY,
      JSON.stringify({ favorites: ["two"], collections: [] }),
    );
    events.dispatchEvent(
      Object.assign(new Event("storage"), { key: LIBRARY_KEY }),
    );
    assert.deepEqual(reloaded.getSnapshot().favorites, ["two"]);
    assert.equal(notifications, 1);
    unavailable = true;
    reloaded.toggleFavorite("one");
    assert.deepEqual(reloaded.getSnapshot().favorites, ["two", "one"]);
    assert.equal(reloaded.getSnapshot().storageError, true);
    assert.equal(createLibraryStore(ids).getSnapshot().storageError, true);
    unavailable = false;
    reloaded.toggleFavorite("two");
    assert.equal(reloaded.getSnapshot().storageError, false);
    storage.setItem(LIBRARY_KEY, "broken JSON");
    events.dispatchEvent(
      Object.assign(new Event("storage"), { key: LIBRARY_KEY }),
    );
    assert.deepEqual(reloaded.getSnapshot().favorites, []);
    assert.equal(reloaded.getSnapshot().storageError, true);
    unsubscribe();
  } finally {
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
});
