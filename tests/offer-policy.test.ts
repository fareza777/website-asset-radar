import test from "node:test";
import assert from "node:assert/strict";
import { isPermittedOfferUrl } from "../scripts/offer-source-policy";
import { formatPrice, calculateDiscount } from "../lib/offer-utils";

test("offer collection allows trusted public evidence, never private endpoints or asset downloads", () => {
  for (const url of [
    "https://www.fab.com/limited-time-free",
    "https://www.fab.com/listings/95ff3c25-59f9-441d-aa43-93c3abd63680",
    "https://www.fab.com/eula",
    "https://assetstore.unity.com/packages/2d/example-123",
    "https://unity.com/legal/as-terms",
    "https://creator.itch.io/example-pack",
    "https://itch.io/s/1234/example-sale",
    "https://www.gamedevmarket.net/asset/example-pack",
    "https://kenney.nl/assets/tiny-town",
    "https://opengameart.org/content/example-pack",
    "https://creativecommons.org/publicdomain/zero/1.0/",
  ])
    assert.equal(isPermittedOfferUrl(url), true, url);
  for (const url of [
    "http://creator.itch.io/example-pack",
    "https://creator.itch.io:444/example-pack",
    "https://secret@creator.itch.io/example-pack",
    "https://creator.itch.io/download",
    "https://creator.itch.io/checkout",
    "https://creator.itch.io/api",
    "https://creator.itch.io/example-pack.zip",
    "https://api.fab.com/listings/95ff3c25-59f9-441d-aa43-93c3abd63680",
    "https://www.fab.com/checkout",
    "https://fab.com.attacker.test/eula",
    "https://localhost/private",
    "https://www.gamedevmarket.net/asset/example.zip",
  ])
    assert.equal(isPermittedOfferUrl(url), false, url);
});

test("paid discounts cannot round to FREE and observed currencies keep correct precision", () => {
  assert.equal(calculateDiscount(100, 0.01), 99);
  assert.equal(calculateDiscount(100, 0), 100);
  assert.equal(formatPrice(12.5, "USD"), "$12.50");
  assert.match(formatPrice(1788104, "IDR"), /1,788,104/);
  assert.equal(formatPrice(200, "JPY"), "¥200");
});
