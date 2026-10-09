import test from "node:test";
import assert from "node:assert/strict";
import { fetchPermitted } from "../scripts/source-policy";

test("a missing product stays an item failure; protected sources are explicitly stopped", async () => {
  const originalFetch = globalThis.fetch;
  const url = "https://api.polyhaven.com/info/policy_test";
  try {
    globalThis.fetch = async () => new Response(null, { status: 404 });
    await assert.rejects(
      fetchPermitted(url),
      (error: Error) =>
        /404/.test(error.message) &&
        !/protection|challenge/i.test(error.message),
    );
    globalThis.fetch = async () => new Response(null, { status: 403 });
    await assert.rejects(fetchPermitted(url), /403.*source protection/);
    globalThis.fetch = async () =>
      new Response("Challenge", {
        headers: { "cf-mitigated": "challenge" },
      });
    await assert.rejects(fetchPermitted(url), /source protection/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
