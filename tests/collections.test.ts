import test from "node:test";
import assert from "node:assert/strict";
import catalog from "../data/assets.json";
import { validateCollections } from "../lib/catalog-schema";

const available = catalog.slice(0, 18);
const now = Date.parse("2026-10-10T00:00:00Z");
// Synthetic editorial fixtures, never publication evidence.
const collection = {
  id: "fixture-town",
  name: "Fixture town",
  description:
    "A small selection of verified free assets for a prototype town.",
  assetIds: available.slice(0, 6).map((asset) => asset.id),
  cover: available[0].id,
  color: "peach",
  updatedAt: "2026-10-09T06:00:00.000Z",
};

test("curated selections retain valid free references and editorial timestamps without mutating data", () => {
  const input = structuredClone([collection]);
  assert.deepEqual(validateCollections(input, available, now), [collection]);
  assert.deepEqual(input, [collection]);
});

test("a curated cover must belong to its own collection, not just the catalog", () => {
  assert.throws(() =>
    validateCollections(
      [{ ...collection, cover: available[6].id }],
      available,
      now,
    ),
  );
});

test("curated selections reject deleted, paid or duplicate member identities", () => {
  for (const invalid of [
    "removed-asset",
    "unlisted-paid-promotion",
    collection.assetIds[1],
  ]) {
    assert.throws(() =>
      validateCollections(
        [
          {
            ...collection,
            assetIds: [...collection.assetIds.slice(0, 5), invalid],
          },
        ],
        available,
        now,
      ),
    );
  }
});

test("collection metadata cannot publish duplicate names, future updates or unsupported colors", () => {
  assert.throws(() =>
    validateCollections(
      [collection, { ...collection, id: "different-id", name: "FIXTURE TOWN" }],
      available,
      now,
    ),
  );
  assert.throws(() =>
    validateCollections(
      [{ ...collection, updatedAt: "2026-10-10T00:00:01.000Z" }],
      available,
      now,
    ),
  );
  assert.throws(() =>
    validateCollections(
      [{ ...collection, updatedAt: "2026-02-30T00:00:00Z" }],
      available,
      now,
    ),
  );
  assert.throws(() =>
    validateCollections(
      [{ ...collection, color: "invented-style" }],
      available,
      now,
    ),
  );
});

test("curated collections stay substantial and compact instead of becoming an unfiltered category", () => {
  assert.throws(() =>
    validateCollections(
      [{ ...collection, assetIds: collection.assetIds.slice(0, 5) }],
      available,
      now,
    ),
  );
  assert.throws(() =>
    validateCollections(
      [
        {
          ...collection,
          assetIds: available.slice(0, 17).map((asset) => asset.id),
        },
      ],
      available,
      now,
    ),
  );
});
