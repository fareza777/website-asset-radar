import test from "node:test";
import assert from "node:assert/strict";
import catalog from "../data/assets.json";
import promotions from "../data/offers.json";
import { defaultFilters, type Asset, type Promotion } from "../lib/types";
import { filterAssets } from "../lib/catalog-utils";
import { parseFilterUrl, serializeFilterUrl } from "../lib/filter-url";
import { compatibilityFor } from "../lib/engine-compatibility";
import { publisherForAsset, publishers } from "../lib/publishers";

const free = catalog as Asset[];
const offers = promotions as Promotion[];
const all = [...free, ...offers];

test("shareable filters round-trip together and preserve unrelated collection parameters", () => {
  const filters = { ...defaultFilters, query: "pixel art", engine: "Godot", publisher: "kenney", format: "PNG", type: "free" as const, discount: "50" as const, compatibility: "Importable" as const, sort: "quality" as const };
  const url = serializeFilterUrl(filters, {}, "collection=my-project&query=old");
  assert.deepEqual(parseFilterUrl(url), filters);
  assert.equal(new URLSearchParams(url).get("collection"), "my-project");
  assert.equal(new URLSearchParams(url).getAll("query").length, 1);
  assert.equal(serializeFilterUrl(defaultFilters, {}, url), "collection=my-project");
  assert.equal(serializeFilterUrl({ ...defaultFilters, category: "RPG" }, { category: "RPG" }), "");
});

test("invalid enum filters and oversized search strings fall back to route defaults", () => {
  const filters = parseFilterUrl(`type=anything&sort=random&discount=1&compatibility=Guaranteed&query=${"x".repeat(201)}`, { category: "Audio" });
  assert.deepEqual(filters, { ...defaultFilters, category: "Audio" });
  assert.equal(parseFilterUrl("query=%E9%9F%B3%E6%A5%BD").query, "音楽");
});

test("publisher, format, engine, availability, genre and license compose as AND filters", () => {
  const results = filterAssets(all, { ...defaultFilters, publisher: "kenney", format: "png", type: "free", engine: "Godot", compatibility: "Importable", license: "CC0", category: "RPG" });
  assert.ok(results.length > 0);
  for (const asset of results) {
    assert.equal(asset.author, "Kenney");
    assert.equal(asset.type, "free");
    assert.ok(asset.formats.includes("PNG"));
    assert.ok(asset.categories.includes("RPG"));
    assert.equal(compatibilityFor(asset, "Godot").status, "Importable");
  }
  assert.equal(filterAssets(all, { ...defaultFilters, publisher: "kenney", type: "deal" }).length, 0);
  for (const cutoff of ["30", "50", "70"] as const) {
    const discounted = filterAssets(all, { ...defaultFilters, discount: cutoff });
    assert.ok(discounted.length > 0);
    assert.ok(discounted.every((asset) => asset.type !== "free" && asset.discountPercent >= Number(cutoff)));
  }
});

test("engine tags, ZIP archives and model preview images cannot claim compatibility", () => {
  const asset = free[0];
  assert.equal(compatibilityFor({ ...asset, engines: ["Unity"], formats: ["ZIP"] }, "Unity").status, "Unverified");
  assert.equal(compatibilityFor({ ...asset, dimension: "3D", assetType: "3D Models", formats: ["PNG"] }, "Godot").status, "Unverified");
  assert.equal(compatibilityFor({ ...asset, assetType: "Tools & Plugins", formats: ["PNG"] }, "Unity").status, "Unverified");
  assert.equal(compatibilityFor({ ...asset, engines: ["Unity"], formats: ["UNITYPACKAGE"] }, "Unity").status, "Native");
  assert.equal(compatibilityFor({ ...asset, formats: ["PNG"] }, "Godot").status, "Importable");
  assert.equal(compatibilityFor({ ...asset, formats: ["UNITYPACKAGE"], engines: [] }, "Unity").status, "Unverified");
  const noEngine = { ...asset, id: "archive-only", formats: ["ZIP"] };
  const importable = { ...asset, id: "png-content", formats: ["PNG"] };
  assert.deepEqual(filterAssets([noEngine, importable], { ...defaultFilters, compatibility: "Unverified" }).map((item) => item.id), ["archive-only"]);
});

test("ten featured publisher identities do not infer authorship from product titles", () => {
  assert.equal(publishers.length, 10);
  assert.equal(new Set(publishers.map((publisher) => publisher.id)).size, 10);
  assert.equal(publisherForAsset({ author: "Kay Lousberg" })?.id, "kaykit");
  assert.equal(publisherForAsset({ author: "Synty Studios" })?.id, "synty");
  assert.equal(publisherForAsset({ author: "Unrelated creator" }), undefined);
});
