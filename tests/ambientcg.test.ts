import test from "node:test";
import assert from "node:assert/strict";
import {
  readAmbientLicense,
  readAmbientMetadata,
  ambientFormats,
} from "../scripts/ambientcg";

// Synthetic contract fixtures, never published as catalog records.
const metadata = {
  assetId: "Stone001",
  dataType: "Material",
  displayName: "Stone 001",
  displayCategory: "Stone",
  shortLink: "https://ambientcg.com/a/Stone001",
  tags: ["stone"],
  maps: ["color", "normal"],
  previewImage: {
    "512-WEBP":
      "https://acg-media.struffelproductions.com/file/ambientCG-Web/media/thumbnail/512-WEBP/Stone001.webp",
  },
  downloadFolders: {
    default: {
      downloadFiletypeCategories: {
        zip: {
          downloads: [
            {
              attribute: "1K-PNG",
              fullDownloadPath:
                "https://ambientcg.com/get?file=Stone001_1K-PNG.zip",
              fileName: "Stone001_1K-PNG.zip",
            },
          ],
        },
      },
    },
  },
};
test("ambientCG requires an explicit license covering assets and material preview renders", () => {
  assert.equal(
    readAmbientLicense(
      "<body>Other providers use CC0. All rights reserved.</body>",
    ),
    false,
  );
  assert.equal(
    readAmbientLicense(
      "<body>All ambientCG assets are provided under the Creative Commons CC0 1.0 Universal License.</body>",
    ),
    false,
  );
  assert.equal(
    readAmbientLicense(
      "<body>All ambientCG assets are provided under the Creative Commons CC0 1.0 Universal License. This applies to the downloadable asset files and the material preview renders shown for each asset on the site.</body>",
    ),
    true,
  );
});
test("ambientCG formats come from explicit content attributes rather than ZIP packaging", () => {
  assert.deepEqual(ambientFormats(readAmbientMetadata(metadata)), ["PNG"]);
  const unknown = structuredClone(metadata);
  unknown.downloadFolders.default.downloadFiletypeCategories.zip.downloads[0].attribute =
    "archive";
  assert.throws(() => readAmbientMetadata(unknown), /explicit content format/);
  assert.throws(
    () =>
      readAmbientMetadata({
        ...metadata,
        shortLink: "https://example.test/Stone001",
      }),
    /identity mismatch/,
  );
});
test("ambientCG cannot publish another product's preview or an unrelated CDN image", () => {
  for (const url of [
    metadata.previewImage["512-WEBP"].replace("Stone001.webp", "Wood001.webp"),
    "https://example.test/Stone001.webp",
  ])
    assert.throws(
      () =>
        readAmbientMetadata({ ...metadata, previewImage: { "512-WEBP": url } }),
      /preview identity/,
    );
});
