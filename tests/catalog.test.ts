import test from "node:test";
import assert from "node:assert/strict";
import catalog from "../data/assets.json";
import { defaultFilters, type Asset } from "../lib/types";
import { filterAssets, canonicalUrl, parseLibrary } from "../lib/catalog-utils";
import { validateCatalog, validateEvidenceDate } from "../lib/catalog-schema";

const assets = catalog as Asset[];

test("search finds file formats, engine names and licenses", () => {
  for (const query of ["GLB", "PNG", "OGG", "CC0", "Godot", "Unity"])
    assert.ok(
      filterAssets(assets, { ...defaultFilters, query }).length > 0,
      query,
    );
});

test("search combines words, genre, dimension, type, engine, license and source", () => {
  // Representative fixtures keep filter behavior independent of catalog growth.
  const fixtures = assets.filter((asset) =>
    [
      "kenney-tiny-town",
      "kenney-tiny-farm",
      "kenney-tiny-battle",
      "kenney-tiny-dungeon",
      "kenney-nature-kit",
      "kenney-ui-pack",
      "kenney-interface-sounds",
    ].includes(asset.id),
  );
  const results = filterAssets(fixtures, {
    ...defaultFilters,
    query: "dungeon Kenney",
    category: "RPG",
    dimension: "2D",
    assetType: "Tilesets",
    engine: "Godot",
    license: "CC0",
    source: "Kenney",
  });
  assert.deepEqual(
    results.map((asset) => asset.id),
    ["kenney-tiny-dungeon"],
  );
  assert.equal(
    filterAssets(fixtures, {
      ...defaultFilters,
      category: "Audio",
      dimension: "3D",
    }).length,
    0,
  );
  assert.equal(
    filterAssets(fixtures, { ...defaultFilters, query: "  TiNy   KeNnEy " })
      .length,
    4,
  );
});

test("latest means catalog addition and sorting leaves the original catalog untouched", () => {
  const input = [
    { ...assets[0], addedAt: "2026-10-01", verifiedAt: "2026-10-08" },
    { ...assets[1], addedAt: "2026-10-05" },
  ];
  assert.equal(
    filterAssets(input, { ...defaultFilters, sort: "latest" })[0].id,
    assets[1].id,
  );
  assert.equal(input[0].id, assets[0].id);
});

test("duplicate identities fail even with www, trailing slashes or tracking parameters", () => {
  const duplicate = {
    ...assets[0],
    id: "different-id",
    sourceUrl: `${assets[0].sourceUrl}/?utm_source=test#preview`,
  };
  assert.throws(
    () => validateCatalog([assets[0], duplicate], "2026-10-08"),
    /Duplicate source/,
  );
  assert.throws(
    () => validateCatalog([assets[0], assets[0]], "2026-10-08"),
    /Duplicate asset/,
  );
  assert.equal(
    canonicalUrl(
      "https://www.kenney.nl/assets/tiny-town/?utm_campaign=test&ref=demo#images",
    ),
    assets[0].sourceUrl,
  );
});

test("uncertain licenses, mismatched source hosts, future dates and wrong preview rights fail", () => {
  for (const patch of [
    { license: "free" },
    { sourceUrl: "https://example.com/assets/tiny-town" },
    { licenseUrl: "https://example.com/license" },
    { verifiedAt: "2026-10-09" },
    { verifiedAt: "2026-02-30" },
    {
      previewProvenance: {
        ...assets[0].previewProvenance,
        license: "CC-BY-4.0",
      },
    },
  ])
    assert.throws(() =>
      validateCatalog([{ ...assets[0], ...patch }], "2026-10-08"),
    );
});

test("displayed verification date follows real evidence timestamps in Jakarta", () => {
  const now = Date.parse("2026-10-09T10:00:00Z");
  validateEvidenceDate(
    "2026-10-08",
    { checkedAt: "2026-10-07T18:00:00Z" },
    now,
  );
  validateEvidenceDate(
    "2026-10-09",
    {
      checkedAt: "2026-10-07T18:00:00Z",
      lastLinkCheckAt: "2026-10-08T18:00:00Z",
    },
    now,
  );
  for (const evidence of [
    {},
    { checkedAt: "invalid" },
    { checkedAt: "2026-10-10T10:00:00Z" },
    {
      checkedAt: "2026-10-08T01:00:00Z",
      lastLinkCheckAt: "2026-10-07T01:00:00Z",
    },
  ])
    assert.throws(() => validateEvidenceDate("2026-10-08", evidence, now));
  assert.throws(
    () =>
      validateEvidenceDate(
        "2026-10-09",
        { checkedAt: "2026-10-08T01:00:00Z" },
        now,
      ),
    /does not match/,
  );
});

test("saved libraries recover malformed values and remove stale or duplicate asset ids", () => {
  const ids = new Set(assets.map((asset) => asset.id));
  assert.deepEqual(parseLibrary("corrupted", ids), {
    favorites: [],
    collections: [],
  });
  const parsed = parseLibrary(
    {
      favorites: [assets[0].id, assets[0].id, "removed", 123],
      collections: [
        {
          id: "safe-id",
          name: "  My project  ",
          assetIds: [assets[0].id, "removed"],
        },
        { id: "safe-id", name: "Duplicate", assetIds: [] },
        { id: "bad/id", name: "Unsafe", assetIds: [] },
      ],
    },
    ids,
  );
  assert.deepEqual(parsed, {
    favorites: [assets[0].id],
    collections: [
      { id: "safe-id", name: "My project", assetIds: [assets[0].id] },
    ],
  });
});
