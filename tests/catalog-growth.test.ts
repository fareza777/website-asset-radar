import test from "node:test";
import assert from "node:assert/strict";
import { discoveryLimit, readKenneyIndex } from "../scripts/discovery-utils";
import { isPermittedUrl } from "../scripts/source-policy";
import { isPermittedOfferUrl } from "../scripts/offer-source-policy";
import { fillGrowthQueue } from "../scripts/catalog-growth-utils";

test("initial backfill can inspect more than a daily maintenance batch", () => {
  assert.equal(discoveryLimit(["--mode=backfill", "--limit=500"]), 500);
  assert.throws(() => discoveryLimit(["--mode=backfill", "--limit=1001"]));
  assert.throws(() => discoveryLimit(["--mode=unknown"]));
});

test("empty fragment pagination links do not consume the page budget twice", () => {
  const index = readKenneyIndex(
    '<a href="/assets/page:2">Next</a><a href="/assets/page:2#">Again</a>',
    "https://kenney.nl/assets",
  );
  assert.deepEqual(index.pages, ["https://kenney.nl/assets/page:2"]);
});

test("ambientCG collection permits its documented API and licensed preview endpoint only", () => {
  assert.equal(
    isPermittedUrl(
      "https://ambientcg.com/api/v2/full_json?limit=100&type=Material",
    ),
    true,
  );
  assert.equal(isPermittedUrl("https://docs.ambientcg.com/license/"), true);
  assert.equal(
    isPermittedUrl(
      "https://acg-media.struffelproductions.com/file/ambientCG-Web/media/thumbnail/512-WEBP/Fabric084.webp",
    ),
    true,
  );
  for (const url of [
    "https://ambientcg.com/login",
    "https://ambientcg.com/get?file=paid.zip",
    "https://acg-media.struffelproductions.com/private/secret",
    "https://ambientcg.com.attacker.test/api/v2/full_json",
  ])
    assert.equal(isPermittedUrl(url), false);
});

test("Unity product scraping remains disabled without the separate source agreement its terms require", () => {
  assert.equal(isPermittedOfferUrl("https://assetstore.unity.com/sale"), false);
  assert.equal(
    isPermittedOfferUrl("https://assetstore.unity.com/packages/2d/example-123"),
    false,
  );
  assert.equal(isPermittedOfferUrl("https://unity.com/legal/as-terms"), true);
});

test("growth continues beyond the first five and replaces failed candidates until the verified target", async () => {
  const candidates = Array.from({ length: 65 }, (_, i) => ({
    source: i % 2 ? "A" : "B",
    sourceUrl: `https://example.test/asset/${i}`,
    payload: i,
  }));
  const result = await fillGrowthQueue(candidates, {
    target: 50,
    maxCandidates: 65,
    deadline: Date.now() + 10_000,
    importCandidate: async (candidate) => {
      if (Number(candidate.payload) < 9) throw new Error("Missing license");
      return `verified-${candidate.payload}`;
    },
  });
  assert.equal(result.added.length, 50);
  assert.equal(result.failures.length, 9);
  assert.equal(result.inspected, 59);
});

test("growth stops a protected source while continuing other sources and rejecting duplicate URLs", async () => {
  const result = await fillGrowthQueue(
    [
      { source: "Blocked", sourceUrl: "https://example.test/a", payload: 1 },
      { source: "Blocked", sourceUrl: "https://example.test/b", payload: 2 },
      { source: "Good", sourceUrl: "https://example.test/c", payload: 3 },
      {
        source: "Good",
        sourceUrl: "https://example.test/c?utm_source=test",
        payload: 4,
      },
      { source: "Good", sourceUrl: "https://example.test/d", payload: 5 },
    ],
    {
      target: 4,
      maxCandidates: 20,
      deadline: Date.now() + 10_000,
      importCandidate: async (candidate) => {
        if (candidate.source === "Blocked") throw new Error("403: protection");
        return `verified-${candidate.payload}`;
      },
    },
  );
  assert.deepEqual(result.added, ["verified-3", "verified-5"]);
  assert.deepEqual(result.blocked, ["Blocked"]);
  assert.equal(result.inspected, 3);
});

test("growth never ignores candidate and time budgets to reach the daily target", async () => {
  const candidates = Array.from({ length: 60 }, (_, i) => ({
    source: "A",
    sourceUrl: `https://example.test/${i}`,
    payload: i,
  }));
  const options = {
    target: 50,
    maxCandidates: 7,
    deadline: Date.now() + 10_000,
    importCandidate: async (c: { payload: unknown }) => `verified-${c.payload}`,
  };
  assert.equal((await fillGrowthQueue(candidates, options)).added.length, 7);
  assert.equal(
    (await fillGrowthQueue(candidates, { ...options, deadline: 0 })).added
      .length,
    0,
  );
});
