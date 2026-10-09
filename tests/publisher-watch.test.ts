import test from "node:test";
import assert from "node:assert/strict";
import data from "../data/publishers.json";
import engineFormats from "../data/engine-formats.json";
import { getPublisher } from "../lib/publishers";
import { validatePublishers, validateEngineFormats, validatePublisherMonitor } from "../lib/discovery-schema";
import { isWatchUrl, readPublisherIndex } from "../scripts/publisher-watch-utils";

test("publisher watch fetches only the configured index and never permission-review sources", () => {
  const kenney = getPublisher("kenney")!;
  assert.ok(isWatchUrl(kenney, "https://kenney.nl/assets/"));
  for (const url of ["http://kenney.nl/assets", "https://kenney.nl/assets?all=1", "https://kenney.nl/assets/private", "https://other.test/assets", "https://user:pass@kenney.nl/assets"]) assert.equal(isWatchUrl(kenney, url), false);
  assert.equal(isWatchUrl(getPublisher("synty")!, "https://syntystore.com/"), false);
  assert.equal(isWatchUrl(getPublisher("craftpix")!, "https://craftpix.net/freebies/"), false);
});

test("index extraction keeps observed product identities without guessing prices or licensing", () => {
  const result = readPublisherIndex('<main><a href="/assets/test-pack?utm_source=demo">Test Pack</a><a href="/assets/test-pack">Same pack</a><a href="/support">Support</a><a href="https://evil.test/assets/fake">Fake</a><a href="/assets/test.zip">File</a></main>', getPublisher("kenney")!);
  assert.deepEqual(result.links, [{ url: "https://kenney.nl/assets/test-pack", title: "Same pack" }]);
  assert.match(result.fingerprint, /^[a-f0-9]{64}$/);
  assert.equal("price" in result, false);
  assert.equal("license" in result, false);
});

test("publisher identities and engine documents reject fabricated provenance", () => {
  const parsed = validatePublishers(data);
  assert.equal(parsed.length, 10);
  assert.throws(() => validatePublishers([...data.slice(1), data[1]]));
  assert.throws(() => validatePublishers(data.map((item, index) => index === 1 ? { ...item, aliases: ["Synty"] } : item)));
  validateEngineFormats(engineFormats);
  assert.throws(() => validateEngineFormats([{ ...engineFormats[0], documentationUrl: "https://random.test/engine-support" }]));
  const now = Date.parse("2026-10-10T00:00:00Z");
  const checks = data.map((publisher) => ({ id: publisher.id, url: publisher.watch.url, status: publisher.watch.mode === "permission_review" ? "permission_review" : "blocked", attemptedAt: "2026-10-09T10:00:00Z", checkedAt: null, httpStatus: null, fingerprint: null, productUrls: [], changed: false, note: "No product verification claimed." }));
  const journal = { generatedAt: "2026-10-09T10:01:00Z", checks };
  validatePublisherMonitor(journal, parsed, now);
  assert.throws(() => validatePublisherMonitor({ ...journal, checks: checks.map((check, index) => index === 0 ? { ...check, status: "checked", checkedAt: check.attemptedAt, httpStatus: 200, fingerprint: "a".repeat(64) } : check) }, parsed, now));
});
