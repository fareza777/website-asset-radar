import { z } from "zod";
import { canonicalUrl } from "./catalog-utils";
import {
  assetTypes,
  categories,
  type Promotion,
  type OfferEvidence,
  type ArchivedOffer,
} from "./types";
import {
  calculateDiscount,
  calculateRadarScore,
  MIN_DEAL_DISCOUNT,
  MIN_DEAL_SCORE,
  MIN_DEAL_GRADE,
  offerStatus,
} from "./offer-utils";
export {
  calculateDiscount,
  calculateRadarScore,
  offerStatus,
} from "./offer-utils";

const utc = z.string().refine((v) => {
  const n = Date.parse(v);
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(v) &&
    Number.isFinite(n) &&
    new Date(n).toISOString().slice(0, 19) === v.slice(0, 19)
  );
}, "Use a real UTC timestamp with an explicit timezone");
const https = z.url().refine((v) => {
  try {
    canonicalUrl(v);
    return true;
  } catch {
    return false;
  }
});
const rating = z.number().min(0).max(5).nullable();
const reviewCount = z.number().int().positive().nullable();
const currency = z
  .string()
  .refine(
    (v) => Intl.supportedValuesOf("currency").includes(v),
    "Use a real ISO currency",
  );
const grade = z.number().min(0).max(5);

export const promotionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(3).max(100),
    author: z.string().min(2),
    authors: z.array(z.string()).optional(),
    summary: z.string().min(20).max(240),
    categories: z.array(z.enum(categories)).min(1),
    dimension: z.enum(["2D", "3D", "Audio"]),
    assetType: z.enum(assetTypes),
    type: z.enum(["limited_free", "deal"]),
    originalPrice: z.number().positive().finite(),
    salePrice: z.number().nonnegative().finite(),
    discountPercent: z.number().int().min(1).max(100),
    currency,
    expiresAt: utc.nullable(),
    rating,
    reviewCount,
    radarScore: z.number().int().min(0).max(100),
    source: z.enum([
      "Fab",
      "Unity Asset Store",
      "itch.io",
      "GameDev Market",
      "Kenney",
      "OpenGameArt",
    ]),
    sourceUrl: https,
    canonicalSourceUrl: https,
    license: z.string().min(3),
    licenseUrl: https,
    commercialUse: z.literal(true),
    lastChecked: utc,
    addedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    formats: z.array(z.string().min(2)).min(1),
    engines: z.array(z.string()),
    engineNote: z.string().min(20),
    tags: z.array(z.string()).min(1),
    fileCount: z.number().int().positive().optional(),
    featured: z.boolean().optional(),
    preview: z
      .string()
      .regex(/^\/previews\/[a-z0-9-]+\.webp$/)
      .nullable(),
    thumbnailPermission: z
      .object({
        permissionUrl: https,
        license: z.string().min(3),
        note: z.string().min(30),
      })
      .strict()
      .nullable(),
    licenseNote: z.string().min(20),
    priceNote: z.string().min(10),
    licenseTier: z.string().nullable(),
    curation: z
      .object({
        quality: grade,
        value: grade,
        completeness: grade,
        reputation: grade,
        rationale: z.string().min(60).max(500),
      })
      .strict(),
  })
  .strict();

export const offerEvidenceSchema = z
  .object({
    id: z.string(),
    sourceUrl: https,
    checkedAt: utc,
    method: z.enum(["browser", "permitted-fetch"]),
    httpStatus: z.literal(200),
    price: z
      .object({
        originalPrice: z.number().positive(),
        salePrice: z.number().nonnegative(),
        currency,
        licenseTier: z.string().nullable(),
        note: z.string().min(15),
      })
      .strict(),
    license: z
      .object({
        name: z.string(),
        url: https,
        commercialUse: z.boolean(),
        note: z.string().min(20),
      })
      .strict(),
    expiresAt: utc.nullable(),
    expiryEvidenceUrl: https.nullable(),
    expiryNote: z.string().min(15).nullable(),
    rating,
    reviewCount,
    productNote: z.string().min(30),
  })
  .strict();

export function isTrustedProduct(
  source: Promotion["source"],
  value: string,
): boolean {
  const url = new URL(canonicalUrl(value));
  switch (source) {
    case "Fab":
      return (
        url.hostname === "fab.com" &&
        /^\/listings\/[a-f0-9-]{36}$/.test(url.pathname)
      );
    case "Unity Asset Store":
      return (
        url.hostname === "assetstore.unity.com" &&
        url.pathname.startsWith("/packages/")
      );
    case "itch.io":
      return (
        /^[a-z0-9][a-z0-9-]*\.itch\.io$/.test(url.hostname) &&
        /^\/[a-z0-9][a-z0-9-]*$/.test(url.pathname)
      );
    case "GameDev Market":
      return (
        url.hostname === "gamedevmarket.net" &&
        url.pathname.startsWith("/asset/")
      );
    case "Kenney":
      return (
        url.hostname === "kenney.nl" && url.pathname.startsWith("/assets/")
      );
    case "OpenGameArt":
      return (
        url.hostname === "opengameart.org" &&
        url.pathname.startsWith("/content/")
      );
  }
}

export function productIdentity(value: string): string {
  const url = new URL(canonicalUrl(value));
  for (const key of ["aid", "affiliate_id", "affiliate", "partner", "referral"])
    url.searchParams.delete(key);
  return canonicalUrl(url.toString());
}

export function isTrustedLicense(offer: Promotion): boolean {
  const url = new URL(canonicalUrl(offer.licenseUrl));
  const product = new URL(canonicalUrl(offer.canonicalSourceUrl));
  if (offer.source === "Fab")
    return (
      offer.license === "Fab Standard" &&
      url.hostname === "fab.com" &&
      url.pathname === "/eula"
    );
  if (offer.source === "Unity Asset Store")
    return url.hostname === "unity.com" && url.pathname.startsWith("/legal/");
  if (offer.source === "itch.io")
    return (
      productIdentity(offer.licenseUrl) ===
      productIdentity(offer.canonicalSourceUrl)
    );
  if (offer.source === "GameDev Market")
    return url.hostname === "gamedevmarket.net";
  return (
    url.hostname === product.hostname ||
    (url.hostname === "creativecommons.org" &&
      /^\/(licenses|publicdomain)\//.test(url.pathname))
  );
}

export function validateOffers(
  input: unknown,
  freeAssets: { id: string; sourceUrl: string }[] = [],
  now = Date.now(),
): Promotion[] {
  const offers = z.array(promotionSchema).parse(input) as Promotion[];
  const ids = new Set(freeAssets.map((a) => a.id)),
    urls = new Set(freeAssets.map((a) => productIdentity(a.sourceUrl)));
  for (const offer of offers) {
    const identity = productIdentity(offer.canonicalSourceUrl);
    if (ids.has(offer.id) || urls.has(identity))
      throw new Error(`Duplicate offer identity: ${offer.id}`);
    ids.add(offer.id);
    urls.add(identity);
    if (
      !isTrustedProduct(offer.source, identity) ||
      productIdentity(offer.sourceUrl) !== identity
    )
      throw new Error(`Untrusted or mismatched product source: ${offer.id}`);
    if (!isTrustedLicense(offer))
      throw new Error(`Untrusted license origin: ${offer.id}`);
    if (
      offer.discountPercent !==
      calculateDiscount(offer.originalPrice, offer.salePrice)
    )
      throw new Error(`Discount does not match verified prices: ${offer.id}`);
    if (offer.radarScore !== calculateRadarScore(offer))
      throw new Error(`Radar Score needs recalculation: ${offer.id}`);
    if ((offer.rating === null) !== (offer.reviewCount === null))
      throw new Error(`Incomplete rating evidence: ${offer.id}`);
    if ((offer.preview === null) !== (offer.thumbnailPermission === null))
      throw new Error(`Thumbnail permission is required: ${offer.id}`);
    if (Date.parse(offer.lastChecked) > now)
      throw new Error(`Future verification: ${offer.id}`);
    const added = Date.parse(`${offer.addedAt}T00:00:00Z`);
    const checkedDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
    }).format(Date.parse(offer.lastChecked));
    if (
      !Number.isFinite(added) ||
      new Date(added).toISOString().slice(0, 10) !== offer.addedAt ||
      offer.addedAt > checkedDate
    )
      throw new Error(`Invalid addition date: ${offer.id}`);
    if (offer.type === "limited_free" && offer.salePrice !== 0)
      throw new Error(
        `Limited free requires a verified zero price: ${offer.id}`,
      );
    if (
      offer.type === "deal" &&
      (offer.salePrice <= 0 ||
        offer.discountPercent < MIN_DEAL_DISCOUNT ||
        offer.radarScore < MIN_DEAL_SCORE ||
        offer.curation.quality < MIN_DEAL_GRADE ||
        offer.curation.value < MIN_DEAL_GRADE ||
        (offer.rating !== null && offer.rating < 4))
    )
      throw new Error(`Deal does not meet curation thresholds: ${offer.id}`);
  }
  return offers;
}

export function validateOfferEvidence(
  offer: Promotion,
  input: unknown,
  now = Date.now(),
): OfferEvidence {
  const proof = offerEvidenceSchema.parse(input) as OfferEvidence;
  if (
    proof.id !== offer.id ||
    productIdentity(proof.sourceUrl) !==
      productIdentity(offer.canonicalSourceUrl) ||
    proof.checkedAt !== offer.lastChecked ||
    Date.parse(proof.checkedAt) > now
  )
    throw new Error(`Evidence product or timestamp mismatch: ${offer.id}`);
  for (const key of [
    "originalPrice",
    "salePrice",
    "currency",
    "licenseTier",
  ] as const)
    if (proof.price[key] !== offer[key])
      throw new Error(`Price evidence mismatch (${key}): ${offer.id}`);
  if (
    proof.license.name !== offer.license ||
    canonicalUrl(proof.license.url) !== canonicalUrl(offer.licenseUrl) ||
    proof.license.commercialUse !== offer.commercialUse
  )
    throw new Error(`License evidence mismatch: ${offer.id}`);
  if (
    proof.expiresAt !== offer.expiresAt ||
    proof.rating !== offer.rating ||
    proof.reviewCount !== offer.reviewCount
  )
    throw new Error(`Deadline or rating evidence mismatch: ${offer.id}`);
  if (offer.expiresAt && (!proof.expiryEvidenceUrl || !proof.expiryNote))
    throw new Error(`Missing authoritative expiry: ${offer.id}`);
  if (
    !offer.expiresAt &&
    (proof.expiryEvidenceUrl !== null || proof.expiryNote !== null)
  )
    throw new Error(
      `Unknown expiry must have null deadline evidence: ${offer.id}`,
    );
  if (proof.expiryEvidenceUrl) {
    const origin = new URL(proof.expiryEvidenceUrl).hostname.replace(
      /^www\./,
      "",
    );
    const productHost = new URL(offer.canonicalSourceUrl).hostname.replace(
      /^www\./,
      "",
    );
    if (
      origin !== productHost &&
      !(offer.source === "itch.io" && origin === "itch.io")
    )
      throw new Error(
        `Expiry must come from the publisher or marketplace: ${offer.id}`,
      );
  }
  return proof;
}

export function reconcileOffers(
  current: Promotion[],
  archived: ArchivedOffer[],
  candidates: Promotion[],
  proofs: Map<string, OfferEvidence>,
  now: number,
) {
  const active: Promotion[] = [],
    archive = new Map(archived.map((item) => [item.offer.id, item]));
  for (const offer of current) {
    const status = offerStatus(offer, now);
    if (status === "active") active.push(offer);
    else
      archive.set(offer.id, {
        offer,
        reason: status,
        archivedAt: new Date(now).toISOString(),
      });
  }
  for (const candidate of candidates) {
    const proof = proofs.get(candidate.id);
    if (!proof)
      throw new Error(`Missing verification evidence: ${candidate.id}`);
    const offer = {
      ...candidate,
      lastChecked: proof.checkedAt,
      discountPercent: calculateDiscount(
        candidate.originalPrice,
        candidate.salePrice,
      ),
      radarScore: calculateRadarScore(candidate),
    };
    validateOffers([offer], [], now);
    validateOfferEvidence(offer, proof, now);
    if (offerStatus(offer, now) !== "active")
      throw new Error(
        `Candidate is expired or needs verification: ${offer.id}`,
      );
    const old =
      archive.get(offer.id)?.offer ?? active.find((a) => a.id === offer.id);
    if (
      old &&
      productIdentity(old.canonicalSourceUrl) !==
        productIdentity(offer.canonicalSourceUrl)
    )
      throw new Error(`Cannot change an offer's product identity: ${offer.id}`);
    const index = active.findIndex((a) => a.id === offer.id);
    if (index >= 0) active[index] = { ...offer, addedAt: old!.addedAt };
    else active.push({ ...offer, addedAt: old?.addedAt ?? offer.addedAt });
    archive.delete(offer.id);
  }
  validateOffers(active, [], now);
  return { active, archive: [...archive.values()] };
}
