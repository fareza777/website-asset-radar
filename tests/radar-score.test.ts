import test from "node:test";
import assert from "node:assert/strict";
import assets from "../data/assets.json";
import offers from "../data/offers.json";
import type { Asset, Promotion } from "../lib/types";
import {
  adjustedRating,
  calculateFreeScore,
  calculateRadarScore,
  freeScoreBreakdown,
  gradeFraction,
  scoreBreakdown,
  SCORE_FACTORS,
} from "../lib/radar-score";

// Mutated copies are test inputs only and are never published.
const free = assets[0] as Asset;
const offer = offers[0] as Promotion;

test("small perfect rating samples carry less weight than substantial strong samples", () => {
  assert.ok(adjustedRating(5, 6) < adjustedRating(4.8, 122));
  const small = { ...offer, rating: 5, reviewCount: 6 };
  const substantial = { ...offer, rating: 4.8, reviewCount: 122 };
  assert.ok(
    scoreBreakdown(small).quality < scoreBreakdown(substantial).quality,
  );
  assert.ok(calculateRadarScore(small) < calculateRadarScore(substantial));
  assert.ok(adjustedRating(2, 200) < adjustedRating(2, 1));
});

test("unrated promotions retain unknown stars and receive limited quality credit", () => {
  const unrated = {
    ...offer,
    rating: null,
    reviewCount: null,
    curation: { ...offer.curation, quality: 5 },
  };
  assert.ok(scoreBreakdown(unrated).quality <= 15);
  assert.equal(unrated.rating, null);
  assert.equal(unrated.reviewCount, null);
});

test("free packs have provisional quality and no imaginary paid-price discount", () => {
  const scores = freeScoreBreakdown(free);
  assert.equal(scores.quality, 15);
  assert.equal(scores.discount, 0);
  assert.ok(scores.value < SCORE_FACTORS.value.maximum);
  assert.ok(calculateFreeScore(free) < 90);
  assert.equal(free.rating, null);
});

test("large file counts and featured placement cannot inflate free quality or value", () => {
  const one = { ...free, fileCount: 1, featured: false };
  const many = { ...free, fileCount: 100000, featured: true };
  assert.equal(calculateFreeScore(one), calculateFreeScore(many));
  assert.deepEqual(freeScoreBreakdown(one), freeScoreBreakdown(many));
  assert.equal(
    calculateFreeScore({ ...free, formats: [...free.formats, "ZIP"] }),
    calculateFreeScore(free),
  );
});

test("discount is bounded and commercial restrictions affect license usability", () => {
  const almostFree = { ...offer, salePrice: 0.001 };
  assert.ok(scoreBreakdown(almostFree).discount <= 10);
  assert.ok(
    calculateRadarScore(almostFree) -
      calculateRadarScore({ ...offer, salePrice: offer.originalPrice / 2 }) <=
      5,
  );
  assert.ok(
    scoreBreakdown({ ...offer, licenseTier: "Personal" }).license <
      scoreBreakdown({ ...offer, licenseTier: null }).license,
  );
  assert.equal(scoreBreakdown({ ...offer, commercialUse: false }).license, 0);
});

test("anchored grades and published scores are reproducible within disclosed weights", () => {
  assert.equal(gradeFraction(3), 0.5);
  assert.equal(gradeFraction(4), 0.75);
  assert.equal(gradeFraction(5), 1);
  assert.ok(gradeFraction(4.5) > gradeFraction(4));
  assert.equal(
    Object.values(SCORE_FACTORS).reduce((sum, f) => sum + f.maximum, 0),
    100,
  );
  for (const asset of [...(assets as Asset[]), ...(offers as Promotion[])]) {
    const parts =
      asset.type === "free" ? freeScoreBreakdown(asset) : scoreBreakdown(asset);
    for (const factor of Object.keys(
      SCORE_FACTORS,
    ) as (keyof typeof SCORE_FACTORS)[]) {
      assert.ok(Number.isInteger(parts[factor]));
      assert.ok(
        parts[factor] >= 0 && parts[factor] <= SCORE_FACTORS[factor].maximum,
      );
    }
    assert.equal(
      asset.radarScore,
      Object.values(parts).reduce((sum, n) => sum + n, 0),
    );
  }
});
