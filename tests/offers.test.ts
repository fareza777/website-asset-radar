import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateDiscount,
  calculateRadarScore,
  offerStatus,
  reconcileOffers,
  validateOfferEvidence,
  validateOffers,
} from "../lib/offers";
import type { Promotion, OfferEvidence } from "../lib/types";
import { calculateDealScore } from "../lib/radar-score";

// Synthetic fixtures only: these are never imported into the public catalog.
const now = Date.parse("2026-10-08T12:00:00Z");
const fixture = (): Promotion => ({
  id: "test-offer",
  title: "Test fixture pack",
  author: "Test creator",
  summary:
    "Synthetic test data for publication validation, never a real offer.",
  categories: ["RPG"],
  dimension: "2D",
  assetType: "Tilesets",
  type: "deal",
  originalPrice: 20,
  salePrice: 5,
  discountPercent: 75,
  currency: "USD",
  expiresAt: "2026-10-09T12:00:00Z",
  rating: 4.5,
  reviewCount: 20,
  radarScore: 0,
  dealScore: 0,
  source: "itch.io",
  sourceUrl: "https://example-creator.itch.io/test-pack",
  canonicalSourceUrl: "https://example-creator.itch.io/test-pack",
  license: "Creator license",
  licenseUrl: "https://example-creator.itch.io/test-pack",
  commercialUse: true,
  lastChecked: "2026-10-08T11:00:00Z",
  addedAt: "2026-10-08",
  formats: ["PNG"],
  engines: ["Godot"],
  engineNote: "PNG images require import and setup in your game engine.",
  tags: ["test"],
  preview: null,
  thumbnailPermission: null,
  licenseNote: "Commercial projects allowed. No standalone redistribution.",
  priceNote: "USD minimum price, before tax.",
  licenseTier: null,
  curation: {
    quality: 4,
    value: 4,
    completeness: 4,
    reputation: 4,
    rationale:
      "Test selection reason: a complete, documented pack with useful formats and an explicit commercial license.",
  },
});
const evidence = (offer = fixture()): OfferEvidence => ({
  id: offer.id,
  sourceUrl: offer.canonicalSourceUrl,
  checkedAt: offer.lastChecked,
  method: "browser",
  httpStatus: 200,
  price: {
    originalPrice: offer.originalPrice,
    salePrice: offer.salePrice,
    currency: offer.currency,
    licenseTier: offer.licenseTier,
    note: "20 USD reduced to 5 USD on the product page.",
  },
  license: {
    name: offer.license,
    url: offer.licenseUrl,
    commercialUse: true,
    note: "The product's own license explicitly permits commercial projects.",
  },
  expiresAt: offer.expiresAt,
  expiryEvidenceUrl: offer.canonicalSourceUrl,
  expiryNote: "The sale page states an end date of 2026-10-09T12:00:00Z.",
  rating: offer.rating,
  reviewCount: offer.reviewCount,
  productNote:
    "The publisher lists PNG tiles and documentation on the product page.",
});
const scored = () => {
  const offer = fixture();
  return { ...offer, radarScore: calculateRadarScore(offer), dealScore: calculateDealScore(offer) };
};

test("discounts require finite verified prices and use actual price math", () => {
  assert.equal(calculateDiscount(20, 5), 75);
  assert.equal(calculateDiscount(19.99, 0), 100);
  assert.equal(calculateDiscount(9, 4.23), 53);
  for (const [original, sale] of [
    [0, 0],
    [20, 20],
    [20, 21],
    [20, -1],
    [NaN, 0],
    [Infinity, 0],
  ])
    assert.throws(() => calculateDiscount(original, sale));
});

test("expiry and stale evidence disable promotions at the boundary, including unknown expiry", () => {
  assert.equal(offerStatus(scored(), now), "active");
  assert.equal(
    offerStatus(scored(), Date.parse(fixture().expiresAt!)),
    "expired",
  );
  const unknown = { ...scored(), expiresAt: null };
  assert.equal(offerStatus(unknown, now), "active");
  assert.equal(
    offerStatus(unknown, Date.parse(unknown.lastChecked) + 48 * 60 * 60 * 1000),
    "verification_required",
  );
  assert.equal(
    offerStatus({ ...scored(), lastChecked: "2026-10-08T13:00:00Z" }, now),
    "verification_required",
  );
});

test("scores stay 0–100, account for commercial rights, and never mutate external ratings", () => {
  const offer = fixture();
  const score = calculateRadarScore(offer);
  assert.ok(score >= 60 && score <= 100);
  assert.ok(calculateDealScore(offer) >= 70);
  assert.ok(calculateRadarScore({ ...offer, commercialUse: false }) < score);
  assert.ok(
    calculateRadarScore({
      ...offer,
      curation: { ...offer.curation, quality: 1, value: 1 },
    }) < score,
  );
  const unrated = { ...offer, rating: null, reviewCount: null };
  assert.ok(Number.isInteger(calculateRadarScore(unrated)));
  assert.equal(unrated.rating, null);
  assert.equal(unrated.reviewCount, null);
});

test("a snapshot must match price, currency, tier, product, license, deadline and rating", () => {
  const offer = scored();
  validateOfferEvidence(offer, evidence(offer), now);
  for (const patch of [
    { checkedAt: "2026-10-08T13:00:00Z" },
    { httpStatus: 403 },
    { sourceUrl: "https://other.itch.io/wrong-product" },
    { price: { ...evidence().price, originalPrice: 40 } },
    { price: { ...evidence().price, currency: "EUR" } },
    { price: { ...evidence().price, licenseTier: "Professional" } },
    { license: { ...evidence().license, commercialUse: false } },
    { expiresAt: null },
    { rating: 5 },
    { expiryEvidenceUrl: null },
  ])
    assert.throws(() =>
      validateOfferEvidence(offer, { ...evidence(offer), ...patch }, now),
    );
  assert.throws(() => validateOfferEvidence(offer, undefined, now));
});

test("invalid prices, untrusted URLs, fabricated discounts and weak deals cannot publish", () => {
  const offer = scored();
  assert.equal(validateOffers([offer], [], now).length, 1);
  for (const patch of [
    { originalPrice: null },
    { salePrice: -5 },
    { discountPercent: 99 },
    { currency: "FAKE" },
    { lastChecked: "2026-02-30T11:00:00Z" },
    { expiresAt: "2026-10-09" },
    { commercialUse: false },
    { sourceUrl: "https://127.0.0.1/test-pack" },
    { canonicalSourceUrl: "https://evil.com/test-pack" },
    { licenseUrl: "https://evil.com/license" },
    { radarScore: 100 },
    { dealScore: 100 },
    { rating: 7 },
    { reviewCount: null },
    { originalPrice: 20, salePrice: 19, discountPercent: 5 },
    { preview: "/previews/unlicensed.webp" },
  ])
    assert.throws(() => validateOffers([{ ...offer, ...patch }], [], now));
  assert.throws(() =>
    validateOffers([{ ...offer, type: "limited_free" }], [], now),
  );
});

test("canonical identities defeat affiliate URL duplicates and collisions with free assets", () => {
  const offer = scored();
  const duplicate = {
    ...offer,
    id: "another-id",
    sourceUrl: `${offer.sourceUrl}?utm_source=test&affiliate_id=123`,
  };
  assert.throws(() => validateOffers([offer, duplicate], [], now), /Duplicate/);
  assert.throws(
    () =>
      validateOffers(
        [offer],
        [{ id: "free-id", sourceUrl: offer.canonicalSourceUrl }],
        now,
      ),
    /Duplicate/,
  );
});

test("publisher previews require a static trusted CDN image and the same product without refreshing deal evidence", () => {
  const offer = scored();
  const preview = {
    url: "https://img.itch.zone/aW1hZ2U=/794x1000/gallery.png",
    sourceUrl: offer.canonicalSourceUrl,
    alt: "Publisher gallery image of this synthetic test pack.",
    credit: offer.author,
    checkedAt: "2026-10-08T11:30:00Z",
    note: "Public publisher gallery URL; a preview check is not a fresh price or license check.",
  };
  const validated = validateOffers(
    [{ ...offer, publisherPreview: preview }],
    [],
    now,
  )[0];
  assert.equal(validated.lastChecked, offer.lastChecked);
  assert.equal(validated.thumbnailPermission, null);
  validateOfferEvidence(validated, evidence(offer), now);
  for (const patch of [
    { url: "https://evil.test/gallery.png" },
    { url: "https://img.itch.zone/aW1hZ2U=/original/animated.gif" },
    { url: `${preview.url}?tracking=1` },
    { url: `${preview.url}#tracking` },
    { sourceUrl: "https://other.itch.io/another-pack" },
    { checkedAt: "2026-10-08T12:00:01Z" },
  ]) {
    assert.throws(() =>
      validateOffers(
        [{ ...offer, publisherPreview: { ...preview, ...patch } }],
        [],
        now,
      ),
    );
  }
  const expiredEvidence = { ...validated, lastChecked: "2026-10-06T11:00:00Z" };
  assert.equal(offerStatus(expiredEvidence, now), "verification_required");
});

test("a large discount cannot compensate for weak editorial quality or poor value", () => {
  for (const weakFactor of ["quality", "value"] as const) {
    const offer = {
      ...scored(),
      salePrice: 0.01,
      rating: null,
      reviewCount: null,
      curation: {
        ...scored().curation,
        quality: 5,
        value: 5,
        completeness: 5,
        reputation: 5,
        [weakFactor]: 1,
      },
    };
    offer.discountPercent = calculateDiscount(
      offer.originalPrice,
      offer.salePrice,
    );
    offer.radarScore = calculateRadarScore(offer);
    offer.dealScore = calculateDealScore(offer);
    assert.throws(() => validateOffers([offer], [], now), /curation/);
  }
});

test("unknown expiry has no pretend deadline evidence", () => {
  const offer = { ...scored(), expiresAt: null };
  assert.throws(
    () => validateOfferEvidence(offer, evidence(offer), now),
    /expiry/,
  );
  assert.doesNotThrow(() =>
    validateOfferEvidence(
      offer,
      {
        ...evidence(offer),
        expiryEvidenceUrl: null,
        expiryNote: null,
      },
      now,
    ),
  );
});

test("reconciliation archives expired/stale offers without claiming a fresh check and can restore a reverified offer", () => {
  const offer = scored();
  const result = reconcileOffers(
    [offer],
    [],
    [],
    new Map(),
    now + 3 * 86400000,
  );
  assert.equal(result.active.length, 0);
  assert.equal(result.archive.length, 1);
  assert.equal(result.archive[0].offer.lastChecked, offer.lastChecked);
  const refreshed = {
    ...offer,
    expiresAt: null,
    lastChecked: "2026-10-11T11:00:00Z",
    radarScore: 0,
  };
  const proof = {
    ...evidence(refreshed),
    expiresAt: null,
    expiryEvidenceUrl: null,
    expiryNote: null,
  };
  const restored = reconcileOffers(
    [],
    result.archive,
    [refreshed],
    new Map([[refreshed.id, proof]]),
    Date.parse("2026-10-11T12:00:00Z"),
  );
  assert.equal(restored.active.length, 1);
  assert.equal(restored.archive.length, 0);
  assert.equal(restored.active[0].lastChecked, proof.checkedAt);
  assert.equal(restored.active[0].discountPercent, 75);
  assert.equal(restored.active[0].radarScore, calculateRadarScore(refreshed));
  assert.equal(restored.active[0].dealScore, calculateDealScore(refreshed));
});
