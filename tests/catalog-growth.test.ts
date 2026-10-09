import test from "node:test";
import assert from "node:assert/strict";
import { discoveryLimit, readKenneyIndex } from "../scripts/discovery-utils";
import { isPermittedUrl } from "../scripts/source-policy";
import { isPermittedOfferUrl } from "../scripts/offer-source-policy";
import { fillGrowthQueue } from "../scripts/catalog-growth-utils";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

test("discovery accepts large batches without a fixed catalog quota", () => {
  assert.equal(discoveryLimit(["--mode=backfill", "--limit=500"]), 500);
  assert.equal(discoveryLimit(["--mode=backfill", "--limit=1001"]), 1001);
  assert.equal(discoveryLimit(["--limit=2500"]), 2500);
  for (const value of ["0", "-1", "1.5", "NaN", "Infinity", "9007199254740992"])
    assert.throws(() => discoveryLimit([`--limit=${value}`]));
  assert.throws(() => discoveryLimit(["--mode=unknown"]));
});

test("a new run plans uncapped growth even when 223 items were already added today", () => {
  const fixture = mkdtempSync(join(tmpdir(), "radar-growth-"));
  try {
    mkdirSync(join(fixture, "data"));
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
    }).format(new Date());
    const assets = JSON.parse(readFileSync("data/assets.json", "utf8"))
      .slice(0, 223)
      .map((asset: Record<string, unknown>) => ({
        ...asset,
        addedAt: today,
        verifiedAt: today,
      }));
    writeFileSync(join(fixture, "data/assets.json"), JSON.stringify(assets));
    writeFileSync(join(fixture, "data/offers.json"), "[]");
    writeFileSync(join(fixture, "data/offer-archive.json"), "[]");
    const loader = pathToFileURL(
      createRequire(resolve("package.json")).resolve("tsx"),
    ).href;
    const readPlan = (...args: string[]) => {
      const run = spawnSync(
        process.execPath,
        [
          "--import",
          loader,
          resolve("scripts/grow-catalog.ts"),
          "--plan",
          ...args,
        ],
        {
          cwd: fixture,
          encoding: "utf8",
          env: { ...process.env, TSX_TSCONFIG_PATH: resolve("tsconfig.json") },
        },
      );
      assert.equal(run.status, 0, run.stderr);
      return JSON.parse(run.stdout.trim());
    };
    const plan = readPlan();
    assert.equal(plan.minimumNewItems, 50);
    assert.equal(plan.additionLimit, null);
    assert.equal(plan.inspectionLimit, null);
    assert.equal(plan.minimumRemaining, 50);
    assert.equal(plan.addedBeforeThisRunToday, 223);
    assert.equal(plan.existingItems, 223);
    const remaining = readPlan(
      "--minimum=0",
      "--minutes=30",
      "--downloaded-bytes=12345",
    );
    assert.equal(remaining.minimumRemaining, 0);
    assert.equal(remaining.additionLimit, null);
    assert.equal(remaining.remainingDownloadBytes, 499987655);
    const batch = readPlan("--limit=2500", "--candidates=5000");
    assert.equal(batch.minimumRemaining, 2500);
    assert.equal(batch.additionLimit, null);
    assert.equal(batch.inspectionLimit, null);
    const oldSchedule = readPlan("--limit=50", "--candidates=121");
    assert.equal(oldSchedule.minimumRemaining, 50);
    assert.equal(oldSchedule.additionLimit, null);
    assert.equal(oldSchedule.inspectionLimit, null);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("uncapped growth still stops at the real shared download budget", async () => {
  const candidates = Array.from({ length: 60 }, (_, i) => ({
    source: "A",
    sourceUrl: `https://example.test/${i}`,
    payload: i,
  }));
  let downloaded = 0;
  const result = await fillGrowthQueue(candidates, {
    deadline: Date.now() + 10_000,
    downloadBudgetReached: () => downloaded >= 700,
    importCandidate: async (candidate) => {
      downloaded += 100;
      return `verified-${candidate.payload}`;
    },
  });
  assert.equal(result.added.length, 7);
  assert.equal(result.inspected, 7);
  assert.equal(result.stopReason, "download_budget");
});

test("growth continues past 50 and the old 100-item ceiling until verified inventory is exhausted", async () => {
  const candidates = Array.from({ length: 223 }, (_, i) => ({
    source: "A",
    sourceUrl: `https://example.test/${i}`,
    payload: i,
  }));
  const result = await fillGrowthQueue(candidates, {
    deadline: Date.now() + 10_000,
    importCandidate: async (candidate) => `verified-${candidate.payload}`,
  });
  assert.equal(result.added.length, 223);
  assert.equal(result.inspected, 223);
  assert.equal(result.stopReason, "sources_exhausted");
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
