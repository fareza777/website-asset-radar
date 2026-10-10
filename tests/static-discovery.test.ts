import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  assets,
  offers,
  archivedOffers,
  directoryAssets,
} from "../lib/catalog";
import { defaultFilters, type Filters } from "../lib/types";
import { toCardAsset } from "../lib/catalog-card";
import { filterAssets } from "../lib/catalog-utils";
import { assetCompatibility } from "../lib/engine-compatibility";
import { catalogFacets, scopeCatalogAssets } from "../lib/catalog-discovery";
import { catalogIds, catalogIndexUrl } from "../lib/generated/catalog";
import { iconSpriteUrl } from "../lib/generated/icons";

const all = [...assets, ...offers];
const cards = all.map(toCardAsset);

test("compact discovery keeps search, combined filters, ordering and compatibility identical", () => {
  const combinations: Partial<Filters>[] = [
    {},
    { query: "pixel" },
    { source: "Poly Haven", assetType: "Textures" },
    {
      publisher: "kenney",
      engine: "Godot",
      format: "PNG",
      category: "RPG",
      license: "CC0",
    },
    { dimension: "3D", engine: "Unity", compatibility: "Importable" },
    { compatibility: "Unverified" },
    { type: "deal", discount: "50" },
    ...(
      ["curated", "latest", "name", "quality", "discount", "deal"] as const
    ).map((sort) => ({ sort })),
  ];
  for (const combination of combinations) {
    const filters = { ...defaultFilters, ...combination };
    assert.deepEqual(
      filterAssets(cards, filters).map((asset) => asset.id),
      filterAssets(all, filters).map((asset) => asset.id),
    );
  }
  for (const asset of all)
    assert.deepEqual(
      assetCompatibility(toCardAsset(asset)),
      assetCompatibility(asset),
    );
});

test("shared index preserves every verified identity and price without distributing download evidence", async () => {
  const index = JSON.parse(await readFile(`public${catalogIndexUrl}`, "utf8"));
  assert.equal(index.version, 1);
  assert.deepEqual(
    index.assets.map((asset: { id: string }) => asset.id),
    directoryAssets.map((asset) => asset.id),
  );
  assert.deepEqual(
    catalogIds,
    directoryAssets.map((asset) => asset.id),
  );
  assert.deepEqual(
    index.archivedIds,
    archivedOffers.map((item) => item.offer.id),
  );
  for (let i = 0; i < index.assets.length; i++) {
    const compact = index.assets[i],
      original = directoryAssets[i];
    for (const field of [
      "sourceUrl",
      "license",
      "lastChecked",
      "radarScore",
      "dealScore",
      "originalPrice",
      "salePrice",
      "discountPercent",
      "currency",
      "expiresAt",
    ] as const) {
      assert.deepEqual(compact[field], original[field]);
    }
    assert.equal("evidence" in compact, false);
    assert.equal("previewProvenance" in compact, false);
    assert.equal("evidenceSha256" in compact, false);
  }
  assert.ok(
    Buffer.byteLength(JSON.stringify(index.assets)) <
      Buffer.byteLength(JSON.stringify(directoryAssets)) * 0.65,
  );
});

test("page scopes keep publisher/category boundaries and collection order; archived offers remain private", () => {
  const collection = [cards[4].id, cards[0].id, cards[2].id];
  assert.deepEqual(
    scopeCatalogAssets(cards, {
      ids: [...collection, "missing", collection[0]],
    }).map((asset) => asset.id),
    collection,
  );
  assert.deepEqual(
    scopeCatalogAssets(cards, { type: "free", license: "CC0" }).map(
      (asset) => asset.id,
    ),
    assets.filter((asset) => asset.license === "CC0").map((asset) => asset.id),
  );
  assert.ok(
    scopeCatalogAssets(cards, { publisher: "kenney" }).every(
      (asset) => asset.author === "Kenney",
    ),
  );
  assert.ok(
    scopeCatalogAssets(cards, { type: "free", category: "Audio" }).every(
      (asset) => asset.type === "free" && asset.categories.includes("Audio"),
    ),
  );
  const archived = cards[0].id;
  assert.ok(
    !scopeCatalogAssets(cards, {}, [archived]).some(
      (asset) => asset.id === archived,
    ),
  );
  assert.ok(
    scopeCatalogAssets(cards, { includeArchived: true }, [archived]).some(
      (asset) => asset.id === archived,
    ),
  );
  assert.deepEqual(catalogFacets(cards), catalogFacets(all));
});

test("shared sprite contains every UI icon in every supported weight, with its license", async () => {
  const sprite = await readFile(`public${iconSpriteUrl}`, "utf8");
  const source = await readFile("lib/icons.tsx", "utf8");
  const names = [...source.matchAll(/createIcon\(\s*"(\w+)"\s*,?\s*\)/g)].map(
    (match) => match[1],
  );
  assert.ok(names.length > 0);
  for (const name of names)
    for (const weight of [
      "regular",
      "thin",
      "light",
      "bold",
      "fill",
      "duotone",
    ]) {
      assert.ok(
        sprite.includes(`id="${name}-${weight}"`),
        `Missing ${name}/${weight}`,
      );
    }
  assert.ok(sprite.includes("MIT License"));
  assert.ok(sprite.includes("Copyright"));
});
