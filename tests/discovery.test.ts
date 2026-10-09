import test from "node:test";
import assert from "node:assert/strict";
import { discoveryLimit, readKenneyIndex } from "../scripts/discovery-utils";

test("discovery batches can exceed the former quota while malformed sizes are rejected", () => {
  assert.equal(discoveryLimit([]), 150);
  assert.equal(discoveryLimit(["--limit=1"]), 1);
  assert.equal(discoveryLimit(["--limit=150"]), 150);
  assert.equal(discoveryLimit(["--limit=151"]), 151);
  assert.equal(discoveryLimit(["--limit=5000"]), 5000);
  for (const value of [
    "0",
    "9007199254740992",
    "-1",
    "1.5",
    "NaN",
    "Infinity",
    "",
  ]) {
    assert.throws(() => discoveryLimit([`--limit=${value}`]));
  }
  assert.throws(() => discoveryLimit(["--limit=5", "--limit=10"]));
});

test("discovery follows only observed same-source product and pagination links", () => {
  const result = readKenneyIndex(
    `
    <a href="/assets/tiny-town">Pack</a><a href="https://kenney.nl/assets/tiny-town">Duplicate</a>
    <a href="/assets/page:2">Next</a><a href="/assets/page:2">Next duplicate</a>
    <a href="https://evil.test/assets/fake">External</a>
    <a href="https://kenney.nl@evil.test/assets/fake">Impersonation</a>
    <a href="/assets/page:0">Invalid page</a><a href="/assets/pack?redirect=other">Query</a>
    <a href="/assets/download.zip">Archive</a><a href="http://kenney.nl/assets/unsafe">HTTP</a>
  `,
    "https://kenney.nl/assets",
  );
  assert.deepEqual(result.products, ["https://kenney.nl/assets/tiny-town"]);
  assert.deepEqual(result.pages, ["https://kenney.nl/assets/page:2"]);
});
