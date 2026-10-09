import test from "node:test";
import assert from "node:assert/strict";
import assets from "../data/assets.json";
import offers from "../data/offers.json";
import type { Asset, Promotion } from "../lib/types";
import {
  adjustedRating,
  calculateFreeScore,
  calculateRadarScore,
  calculateDealScore,
  dealScoreBreakdown,
  DEAL_FACTORS,
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
  assert.ok(scoreBreakdown(unrated).quality <= 20);
  assert.equal(unrated.rating, null);
  assert.equal(unrated.reviewCount, null);
});

test("free packs have provisional quality and no imaginary paid-price discount", () => {
  const scores = freeScoreBreakdown(free);
  assert.equal(scores.quality, 20);
  assert.ok(scores.completeness < SCORE_FACTORS.completeness.maximum);
  assert.equal(free.dealScore, null);
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

test("prices and discount size affect Deal Score but never asset quality", () => {
  const almostFree = { ...offer, salePrice: 0.001 };
  const halfPrice = { ...offer, salePrice: offer.originalPrice / 2 };
  assert.ok(dealScoreBreakdown(almostFree).discount <= 20);
  assert.deepEqual(scoreBreakdown(almostFree), scoreBreakdown(halfPrice));
  assert.equal(calculateRadarScore(almostFree), calculateRadarScore(halfPrice));
  assert.ok(calculateDealScore(almostFree) > calculateDealScore(halfPrice));
  assert.equal(calculateRadarScore({ ...offer, curation: { ...offer.curation, value: 0 } }), calculateRadarScore(offer));
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
    if (asset.type !== "free") {
      const dealParts = dealScoreBreakdown(asset);
      assert.equal(asset.dealScore, calculateDealScore(asset));
      for (const factor of Object.keys(DEAL_FACTORS) as (keyof typeof DEAL_FACTORS)[]) {
        assert.ok(dealParts[factor] >= 0 && dealParts[factor] <= DEAL_FACTORS[factor].maximum);
      }
    }
  }
  assert.equal(Object.values(DEAL_FACTORS).reduce((sum, f) => sum + f.maximum, 0), 100);
});
