import test from "node:test";
import assert from "node:assert/strict";
import {
  convertToUsd,
  FX_MAX_AGE_MS,
  validateExchangeRates,
} from "../lib/exchange-rates";
import { usdPrice } from "../lib/usd-prices";
import { parseEcbRates } from "../scripts/ecb-rates";

// Synthetic exchange rates only; never enter the public reference snapshot.
const checkedAt = "2026-10-09T00:00:00Z",
  now = Date.parse(checkedAt);
const xml = `<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01" xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref"><Cube><Cube time="2026-10-08"><Cube currency="USD" rate="2"/><Cube currency="IDR" rate="40000"/></Cube></Cube></gesmes:Envelope>`;
const rates = parseEcbRates(xml, checkedAt);

test("USD conversions use dated EUR cross-rates and preserve source prices", () => {
  const sourcePrice = 50000;
  assert.equal(convertToUsd(sourcePrice, "IDR", rates, now), 2.5);
  assert.equal(convertToUsd(5, "EUR", rates, now), 10);
  assert.equal(sourcePrice, 50000);
  assert.equal(usdPrice(sourcePrice, "IDR", now, rates)?.text, "≈ $2.50");
  assert.equal(
    usdPrice(sourcePrice, "IDR", now, rates)?.rateDate,
    "2026-10-08",
  );
  assert.equal(usdPrice(12.5, "USD", now, rates)?.text, "$12.50");
  assert.equal(usdPrice(12.5, "USD", now, rates)?.estimated, false);
});

test("stale or unknown conversions never silently relabel amounts USD", () => {
  const stale = Date.parse(`${rates.date}T00:00:00Z`) + FX_MAX_AGE_MS;
  assert.equal(convertToUsd(50000, "IDR", rates, stale), null);
  assert.equal(usdPrice(50000, "IDR", stale, rates), null);
  assert.equal(convertToUsd(50000, "XXX", rates, now), null);
  assert.equal(convertToUsd(10, "IDR", rates, NaN), null);
  assert.equal(convertToUsd(10, "USD", rates, stale), 10);
});

test("conversion cannot turn small positive paid amounts into a zero price", () => {
  assert.equal(usdPrice(0.001, "USD", now, rates)?.text, "< $0.01");
  assert.equal(usdPrice(1, "IDR", now, rates)?.text, "≈ < $0.01");
  assert.equal(convertToUsd(-1, "USD", rates, now), null);
  assert.equal(convertToUsd(Infinity, "USD", rates, now), null);
});

test("only dated, finite, official rate evidence can support conversions", () => {
  validateExchangeRates(rates, now);
  for (const patch of [
    { sourceUrl: "https://example.test/rates" },
    { date: "2026-02-30" },
    { date: "2026-10-10" },
    { checkedAt: "2026-10-09T01:00:00Z" },
    { rates: { ...rates.rates, IDR: 0 } },
    { rates: { ...rates.rates, USD: Infinity } },
    { rates: { ...rates.rates, FAKE: 1 } },
    { feedSha256: "unverified" },
  ]) {
    assert.throws(() => validateExchangeRates({ ...rates, ...patch }, now));
    assert.equal(convertToUsd(50000, "IDR", { ...rates, ...patch }, now), null);
  }
});

test("ECB parser rejects incomplete and duplicate observations", () => {
  assert.throws(() => parseEcbRates("<Cube/>", checkedAt));
  assert.throws(
    () =>
      parseEcbRates(xml.replace('currency="IDR"', 'currency="USD"'), checkedAt),
    /Duplicate/,
  );
  assert.throws(() =>
    parseEcbRates(xml.replace('rate="40000"', 'rate="NaN"'), checkedAt),
  );
});
