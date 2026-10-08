import test from "node:test";
import assert from "node:assert/strict";
import {
  readKenneyEvidence,
  readPolyHavenLicense,
} from "../scripts/verification";
import {
  isPermittedUrl,
  robotsAllows,
  readLimitedResponse,
} from "../scripts/source-policy";
import { runNpm, runCommand } from "../scripts/process-utils.mjs";

const cc0 = "https://creativecommons.org/publicdomain/zero/1.0/";
const archive =
  "https://kenney.nl/media/pages/assets/tiny-town/123/kenney_tiny-town.zip";
test("a CC0 link elsewhere on a page cannot certify the asset", () => {
  assert.throws(
    () =>
      readKenneyEvidence(
        `<h1>Restricted pack</h1><table><tr><td>License</td><td>All rights reserved</td></tr></table><footer><a href="${cc0}">Other CC0 assets</a></footer><a href="${archive}">Download</a>`,
      ),
    /own license field/,
  );
  const own = `<h1>Tiny Town</h1><table><tr><td>License</td><td><a href="${cc0}">CC0</a></td></tr></table><a href="${archive}">Download</a>`;
  assert.equal(readKenneyEvidence(own).archiveUrl, archive);
  assert.throws(
    () =>
      readKenneyEvidence(
        own.replace(archive, "https://example.com/stolen.zip"),
      ),
    /first-party/,
  );
});

test("Poly Haven needs its explicit asset license, not an unrelated CC0 reference", () => {
  assert.equal(
    readPolyHavenLicense("<body>Our assets are all licensed as CC0.</body>"),
    true,
  );
  assert.equal(
    readPolyHavenLicense(
      "<body>Our logos are copyrighted. Other websites offer CC0.</body>",
    ),
    false,
  );
});

test("automation only requests approved HTTPS hosts and endpoints and respects robots", () => {
  for (const url of [
    archive,
    "https://kenney.nl/assets",
    "https://api.polyhaven.com/info/forest_ground_04",
    "https://api.polyhaven.com/assets?type=textures",
    "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/a/a.jpg",
  ])
    assert.equal(isPermittedUrl(url), true, url);
  for (const url of [
    "http://kenney.nl/assets",
    "https://kenney.nl.evil.com/assets",
    "https://user:secret@kenney.nl/assets",
    "https://kenney.nl:444/assets",
    "https://127.0.0.1/assets",
    "https://polyhaven.com/llms.txt",
    "https://polyhaven.com/textures",
    "https://cdn.polyhaven.com/asset_img/thumbs/a.png",
    "https://quaternius.com/packs/a.html",
  ])
    assert.equal(isPermittedUrl(url), false, url);
  assert.equal(
    robotsAllows(
      "User-agent: *\nDisallow: /assets/private",
      "https://kenney.nl/assets/private",
    ),
    false,
  );
  assert.equal(
    robotsAllows(
      "User-agent: *\nDisallow: /assets/private",
      "https://kenney.nl/assets/tiny-town",
    ),
    true,
  );
});

test("PR helper can invoke npm on this operating system and handles spawn errors", () => {
  assert.match(runNpm(["--version"]), /^\d+\.\d+\.\d+$/);
  assert.throws(
    () => runCommand("assetradar-nonexistent-command", []),
    /failed/,
  );
});

test("response size limits also stop streamed responses without Content-Length", async () => {
  const response = await readLimitedResponse(new Response("allowed"), 10);
  assert.equal(await response.text(), "allowed");
  await assert.rejects(
    readLimitedResponse(new Response("01234567890"), 10),
    /permitted size/,
  );
  await assert.rejects(
    readLimitedResponse(
      new Response("small", { headers: { "Content-Length": "100" } }),
      10,
    ),
    /permitted size/,
  );
});
