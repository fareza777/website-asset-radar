import test from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import { isPermittedUrl, robotsAllows } from "../scripts/source-policy";
import {
  readOpenGameArtEvidence,
  readOpenGameArtIndex,
  inspectOpenGameArtFiles,
  validateOpenGameArtEvidence,
  assertOpenGameArtPageUnchanged,
  selectOpenGameArtDownload,
} from "../scripts/opengameart-utils";
import { validateCatalog } from "../lib/catalog-schema";
import { enrichFreeAsset } from "../lib/free-metadata";
import assets from "../data/assets.json";
import type { Asset } from "../lib/types";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { importOpenGameArt, classifyOpenGameArt } from "../scripts/opengameart";

// Synthetic publisher markup and archive contents; never published as assets.
const product = "https://opengameart.org/content/tiny-lanterns";
const download = "https://opengameart.org/sites/default/files/lanterns.zip";
const cc0 = "http://creativecommons.org/publicdomain/zero/1.0/";
const markup = (license = cc0) => `<article class="node-art view-mode-full">
  <div class="field-name-title"><h2>Tiny Lanterns</h2></div>
  <div class="field-name-author-submitter"><div class="field-items"><a>Test Artist</a></div></div>
  <div class="field-name-field-art-type"><div class="field-items"><a>2D Art</a></div></div>
  <div class="field-name-field-art-tags"><div class="field-items"><a>pixel art</a><a>fantasy</a></div></div>
  <div class="field-name-field-art-licenses"><a href="${license}">License</a></div>
  <div class="field-name-body"><div class="field-items">Lantern sprites for a fantasy game.</div></div>
  <div class="field-name-field-art-attribution"><div class="field-items">Credit Test Artist.</div></div>
  <div class="field-name-field-art-preview"><a href="https://opengameart.org/sites/default/files/marketing.png">Preview</a></div>
  <div class="field-name-field-art-files"><a href="${download}">lanterns.zip</a></div>
  <div id="comments"><div class="field-name-field-art-licenses"><a href="${cc0}">Unrelated</a></div></div>
</article>`;

test("OpenGameArt policy permits public art indices and downloadable asset files, excluding private and style endpoints", () => {
  for (const url of [
    product,
    download,
    "https://opengameart.org/latest?page=2",
    "https://opengameart.org/art-search-advanced?sort_by=count&sort_order=DESC",
  ])
    assert.equal(isPermittedUrl(url), true, url);
  for (const url of [
    "https://opengameart.org/user/login",
    "https://opengameart.org/sites/default/files/styles/medium/public/sprite.png",
    "https://opengameart.org/sites/default/files/script.js",
    "https://opengameart.org/latest?destination=/admin",
    "https://opengameart.org.attacker.test/content/test",
  ])
    assert.equal(isPermittedUrl(url), false, url);
  assert.equal(
    robotsAllows("User-agent: *\nDisallow: /sites/default/files/", download),
    false,
  );
});

test("OpenGameArt verifies the submission's own license and author, never gallery images or comment licenses", () => {
  const evidence = readOpenGameArtEvidence(markup(), product);
  assert.equal(evidence.title, "Tiny Lanterns");
  assert.deepEqual(evidence.authors, ["Test Artist"]);
  assert.equal(evidence.license, "CC0");
  assert.deepEqual(evidence.downloadUrls, [download]);
  assert.deepEqual(evidence.tags, ["pixel art", "fantasy"]);
  assert.equal(evidence.attribution, "Credit Test Artist.");
  assert.throws(
    () =>
      readOpenGameArtEvidence(markup("https://example.com/license"), product),
    /supported license/,
  );
  assert.throws(
    () => readOpenGameArtEvidence(markup().replace("Test Artist", ""), product),
    /author/,
  );
  assert.throws(
    () =>
      readOpenGameArtEvidence(
        markup().replace(download, "https://example.com/paid.zip"),
        product,
      ),
    /download/,
  );
  assert.throws(
    () =>
      readOpenGameArtEvidence(
        markup().replace(
          "Lantern sprites",
          "Personal use only. Lantern sprites",
        ),
        product,
      ),
    /review/,
  );
});

test("OpenGameArt preserves attribution for supported commercial Creative Commons licenses", () => {
  const info = readOpenGameArtEvidence(
    markup("http://creativecommons.org/licenses/by/3.0/"),
    product,
  );
  assert.equal(info.license, "CC-BY-3.0");
  assert.equal(info.licenseUrl, "https://creativecommons.org/licenses/by/3.0/");
  assert.equal(info.attribution, "Credit Test Artist.");
  for (const license of [
    "https://creativecommons.org/licenses/by-nc/4.0/",
    "https://creativecommons.org/licenses/by-sa/4.0/",
    "https://www.gnu.org/licenses/gpl-3.0.html",
  ])
    assert.throws(
      () => readOpenGameArtEvidence(markup(license), product),
      /supported license/,
    );
});

test("OpenGameArt discovery follows observed art rows and pagination, ignoring collections and invented URLs", () => {
  const html = `<div class="view-art"><div class="view-content"><div class="node-art view-mode-art_preview"><div class="field-name-title"><a href="/content/tiny-lanterns">Lanterns</a><a href="https://evil.test/content/stolen">No</a></div></div></div></div>
    <aside><a href="/content/a-collection">Not a product row</a></aside>
    <ul class="pager"><a href="/latest?page=1">Next</a><a href="/latest?page=1#">Again</a><a href="/user/login">No</a></ul>`;
  const info = readOpenGameArtIndex(html, "https://opengameart.org/latest");
  assert.deepEqual(info.products, [product]);
  assert.deepEqual(info.pages, ["https://opengameart.org/latest?page=1"]);
  const popular = readOpenGameArtIndex(
    html.replaceAll(
      "/latest?page=1",
      "/art-search-advanced?keys=&field_art_type_tid%5B0%5D=9&sort_by=count&sort_order=DESC&page=1",
    ),
    "https://opengameart.org/art-search-advanced",
  );
  assert.deepEqual(popular.pages, [
    "https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B0%5D=9&sort_by=count&sort_order=DESC&page=1",
  ]);
});

test("OpenGameArt rechecks reject changed creator credit even when the download URL is stable", () => {
  const asset = {
    ...assets[0],
    source: "OpenGameArt",
    sourceUrl: product,
    title: "Tiny Lanterns",
    author: "Test Artist",
    authors: ["Test Artist"],
    dimension: "2D",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    attribution: `Credit Test Artist. Tiny Lanterns by Test Artist. CC0 (https://creativecommons.org/publicdomain/zero/1.0/). ${product} Preview resized and converted to WebP.`,
  } as Asset;
  assert.doesNotThrow(() =>
    assertOpenGameArtPageUnchanged(asset, download, markup()),
  );
  for (const changed of [
    markup().replace(
      "Credit Test Artist.",
      "Credit the artist and their studio.",
    ),
    markup().replaceAll("Test Artist", "Different Artist"),
    markup("https://creativecommons.org/licenses/by/4.0/"),
    markup().replace(
      download,
      "https://opengameart.org/sites/default/files/new.zip",
    ),
  ])
    assert.throws(
      () => assertOpenGameArtPageUnchanged(asset, download, changed),
      /review/,
    );
});

test("primary asset names and tags determine classification and representative file selection", () => {
  const info = readOpenGameArtEvidence(markup(), product);
  for (const title of [
    "Zelda-like tilesets and sprites",
    "Dungeon Crawl 32x32 tiles",
    "DawnLike tileset",
  ])
    assert.equal(
      classifyOpenGameArt({
        ...info,
        title,
        description: "Includes a UI interface and inventory icons.",
      }).assetType,
      "Tilesets",
    );
  assert.equal(
    classifyOpenGameArt({
      ...info,
      title: "Tiny 16: Basic",
      tags: ["RPG", "tileset", "pixel"],
    }).assetType,
    "Tilesets",
  );
  const choices = [
    "https://opengameart.org/sites/default/files/swoosh.png",
    "https://opengameart.org/sites/default/files/forest_tiles.png",
    "https://opengameart.org/sites/default/files/fontlarge.png",
  ];
  assert.equal(selectOpenGameArtDownload(choices, "Tilesets"), choices[1]);
  const tileSheet =
    "https://opengameart.org/sites/default/files/world_tileset.png";
  assert.equal(
    selectOpenGameArtDownload([download, tileSheet], "Tilesets"),
    tileSheet,
  );
  assert.equal(
    classifyOpenGameArt({
      ...info,
      title: "RPG GUI construction kit",
      tags: [],
      description: "Contains background tiles.",
    }).assetType,
    "UI Kits",
  );
  const backdrop =
    "https://opengameart.org/sites/default/files/mountain_background.png";
  assert.equal(
    selectOpenGameArtDownload([choices[0], backdrop], "Environments"),
    backdrop,
  );
  assert.equal(
    inspectOpenGameArtFiles(
      zipSync({
        "wall.png": new Uint8Array(50),
        "gui/buttons.png": new Uint8Array([1]),
      }),
      download,
      "CC0",
      "UI Kits",
    ).previewFile,
    "gui/buttons.png",
  );
  assert.equal(
    inspectOpenGameArtFiles(
      zipSync({
        "fontlarge.png": new Uint8Array(50),
        "tiles/forest.png": new Uint8Array([1]),
      }),
      download,
      "CC0",
      "Tilesets",
    ).previewFile,
    "tiles/forest.png",
  );
});

test("only inspected download contents supply OpenGameArt formats and preview inputs", () => {
  const archive = zipSync({
    "sprites/lantern.png": new Uint8Array([1, 2, 3]),
    "branding/logo.png": new Uint8Array([9]),
    "License.txt": strToU8("Creative Commons Zero (CC0)"),
  });
  const info = inspectOpenGameArtFiles(archive, download, "CC0");
  assert.deepEqual(info.formats, ["PNG"]);
  assert.equal(info.previewFile, "sprites/lantern.png");
  assert.deepEqual([...info.previewBytes], [1, 2, 3]);
  assert.throws(
    () =>
      inspectOpenGameArtFiles(
        zipSync({ "../escape.png": new Uint8Array([1]) }),
        download,
        "CC0",
      ),
    /unsafe/i,
  );
  assert.throws(
    () =>
      inspectOpenGameArtFiles(
        zipSync({ "logo.png": new Uint8Array([1]) }),
        download,
        "CC0",
      ),
    /preview/i,
  );
  assert.throws(
    () =>
      inspectOpenGameArtFiles(
        zipSync({
          "sprite.png": new Uint8Array([1]),
          "License.txt": strToU8("Personal use only"),
        }),
        download,
        "CC0",
      ),
    /license/i,
  );
  assert.throws(
    () =>
      inspectOpenGameArtFiles(
        zipSync({
          "sprite.png": new Uint8Array([1]),
          "License.txt": strToU8(
            "https://creativecommons.org/licenses/by-nc/4.0/",
          ),
        }),
        download,
        "CC-BY-3.0",
      ),
    /license/i,
  );
  assert.throws(
    () =>
      inspectOpenGameArtFiles(
        zipSync({
          "sprite.png": new Uint8Array([1]),
          "License.txt": strToU8(
            "https://creativecommons.org/licenses/by/4.0/",
          ),
        }),
        download,
        "CC-BY-3.0",
      ),
    /license/i,
  );
  for (const [selected, declaration] of [
    ["CC0", "CC-BY-4.0"],
    ["CC-BY-3.0", "CC BY 4.0"],
  ])
    assert.throws(
      () =>
        inspectOpenGameArtFiles(
          zipSync({
            "sprite.png": new Uint8Array([1]),
            "License.txt": strToU8(declaration),
          }),
          download,
          selected,
        ),
      /license/i,
    );
});

test("OpenGameArt catalog entries require matching product identity, downloadable preview origin and attribution", () => {
  const base = assets[0] as Asset;
  const fixture = enrichFreeAsset(
    {
      ...base,
      id: "oga-tiny-lanterns",
      source: "OpenGameArt",
      sourceUrl: product,
      verificationUrl: product,
      license: "CC-BY-3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
      attribution:
        "Tiny Lanterns by Test Artist. Crop and WebP conversion. CC-BY-3.0.",
      previewProvenance: {
        ...base.previewProvenance,
        url: download,
        license: "CC-BY-3.0",
      },
    },
    base.lastChecked,
  );
  assert.doesNotThrow(() => validateCatalog([fixture]));
  for (const patch of [
    { verificationUrl: "https://example.com/content/tiny-lanterns" },
    { sourceUrl: "https://opengameart.org/user/login" },
    { attribution: undefined },
    {
      previewProvenance: {
        ...fixture.previewProvenance,
        url: "https://example.com/asset.png",
      },
    },
  ])
    assert.throws(() => validateCatalog([{ ...fixture, ...patch }]));
});

test("the OpenGameArt importer writes a verified asset and licensed preview, skips duplicates and leaves rejected products unpublished", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "radar-oga-import-"));
  const previousCwd = process.cwd(),
    originalFetch = globalThis.fetch;
  const pixels = await sharp({
    create: { width: 32, height: 32, channels: 4, background: "#65a87c" },
  })
    .png()
    .toBuffer();
  const archive = zipSync({
    "sprites/lantern.png": pixels,
    "License.txt": strToU8("Creative Commons Zero (CC0)"),
  });
  try {
    await mkdir(join(workspace, "data"));
    await writeFile(
      join(workspace, "data/assets.json"),
      JSON.stringify([assets[0]]),
    );
    await writeFile(join(workspace, "data/offers.json"), "[]");
    await writeFile(join(workspace, "data/offer-archive.json"), "[]");
    globalThis.fetch = async (input) => {
      const url = String(input);
      if (url === "https://opengameart.org/robots.txt")
        return new Response("User-agent: *\nDisallow: /user/");
      if (url === product) return new Response(markup());
      if (url === download) return new Response(archive);
      if (url === "https://opengameart.org/content/restricted")
        return new Response(markup("https://example.com/license"));
      throw new Error(`Unexpected network request: ${url}`);
    };
    process.chdir(workspace);
    assert.equal(await importOpenGameArt(product), "oga-tiny-lanterns");
    const catalog = JSON.parse(await readFile("data/assets.json", "utf8"));
    assert.equal(catalog.length, 2);
    const item = catalog[1];
    assert.equal(item.source, "OpenGameArt");
    assert.deepEqual(item.formats, ["PNG"]);
    assert.deepEqual(item.engines, []);
    assert.equal(item.rating, null);
    assert.equal(item.originalPrice, null);
    const evidence = JSON.parse(
      await readFile(`data/evidence/${item.id}.json`, "utf8"),
    );
    assert.equal(evidence.license, "CC0");
    assert.equal(evidence.downloadUrl, download);
    assert.equal(evidence.previewSha256, item.previewProvenance.sha256);
    assert.doesNotThrow(() => validateOpenGameArtEvidence(item, evidence));
    for (const patch of [
      { license: "CC-BY-4.0" },
      { downloadUrls: [] },
      { formats: ["UNITYPACKAGE"] },
      { previewFile: "marketing.png" },
      { authors: ["Different Creator"] },
    ])
      assert.throws(() =>
        validateOpenGameArtEvidence(item, { ...evidence, ...patch }),
      );
    const media = await sharp(
      await readFile(`public${item.preview}`),
    ).metadata();
    assert.equal(media.format, "webp");
    assert.equal(media.width, 800);
    assert.equal(await importOpenGameArt(product), null);
    await assert.rejects(
      importOpenGameArt("https://opengameart.org/content/restricted"),
      /supported license/,
    );
    assert.equal(
      JSON.parse(await readFile("data/assets.json", "utf8")).length,
      2,
    );
    assert.deepEqual(await readdir("data/evidence"), [
      "oga-tiny-lanterns.json",
    ]);
  } finally {
    process.chdir(previousCwd);
    globalThis.fetch = originalFetch;
    await rm(workspace, { recursive: true, force: true });
  }
});
