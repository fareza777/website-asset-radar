import { z } from "zod";
import { assetTypes, categories } from "./types";
import { canonicalUrl } from "./catalog-utils";
import { calculateFreeScore } from "./offer-utils";

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const parsed = new Date(`${v}T00:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v
    );
  }, "Invalid calendar date");
const sha = z.string().regex(/^[a-f0-9]{64}$/);
const https = z.url().refine((v) => {
  try {
    canonicalUrl(v);
    return true;
  } catch {
    return false;
  }
}, "Use a public HTTPS URL");

export const assetSchema = z
  .object({
    type: z.literal("free"),
    originalPrice: z.null(),
    salePrice: z.literal(0),
    discountPercent: z.null(),
    currency: z.null(),
    expiresAt: z.null(),
    rating: z.null(),
    reviewCount: z.null(),
    radarScore: z.number().int().min(0).max(100),
    dealScore: z.null(),
    commercialUse: z.literal(true),
    lastChecked: z.iso.datetime(),
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(3).max(100),
    author: z.string().min(2),
    authors: z.array(z.string().min(2)).min(1).optional(),
    summary: z.string().min(20).max(240),
    categories: z.array(z.enum(categories)).min(1),
    dimension: z.enum(["2D", "3D", "Audio"]),
    assetType: z.enum(assetTypes),
    source: z.enum(["Kenney", "Poly Haven", "ambientCG"]),
    sourceUrl: https,
    license: z.enum(["CC0", "CC-BY-4.0"]),
    licenseUrl: https,
    verificationUrl: https,
    verifiedAt: date,
    addedAt: date,
    evidence: z.string().min(10).max(400),
    evidenceSha256: sha,
    formats: z.array(z.string().min(2)).min(1),
    engines: z.array(z.enum(["Unity", "Godot", "Unreal", "GameMaker"])),
    engineNote: z.string().min(30),
    tags: z.array(z.string().min(1)).min(1),
    fileCount: z.number().int().positive().optional(),
    preview: z.string().regex(/^\/previews\/[a-z0-9-]+\.webp$/),
    audioPreview: z
      .string()
      .regex(/^\/audio\/[a-z0-9-]+\.ogg$/)
      .optional(),
    previewProvenance: z.object({
      url: https,
      file: z.string().min(1),
      license: z.string().min(3),
      sha256: sha,
      note: z.string().min(15),
    }),
    featured: z.boolean().optional(),
  })
  .strict();

export function validateCatalog(
  input: unknown,
  today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  ),
) {
  const assets = z.array(assetSchema).min(1).parse(input);
  const ids = new Set<string>();
  const urls = new Set<string>();
  for (const asset of assets) {
    if (asset.radarScore !== calculateFreeScore(asset))
      throw new Error(`Free Radar Score needs recalculation: ${asset.id}`);
    if (ids.has(asset.id)) throw new Error(`Duplicate asset id: ${asset.id}`);
    const url = canonicalUrl(asset.sourceUrl);
    if (urls.has(url)) throw new Error(`Duplicate source URL: ${url}`);
    ids.add(asset.id);
    urls.add(url);
    const sourceHost = new URL(url).hostname;
    const evidenceHost = new URL(asset.verificationUrl).hostname;
    if (
      asset.source === "Kenney" &&
      (sourceHost !== "kenney.nl" || evidenceHost !== "kenney.nl")
    )
      throw new Error(`Untrusted Kenney source: ${asset.id}`);
    if (
      asset.source === "Poly Haven" &&
      (sourceHost !== "polyhaven.com" || evidenceHost !== "api.polyhaven.com")
    )
      throw new Error(`Untrusted Poly Haven source: ${asset.id}`);
    if (asset.source === "ambientCG" &&
      (sourceHost !== "ambientcg.com" || evidenceHost !== "ambientcg.com" ||
        new URL(asset.verificationUrl).pathname !== "/api/v2/full_json"))
      throw new Error(`Untrusted ambientCG source: ${asset.id}`);
    if (
      asset.license === "CC0" &&
      canonicalUrl(asset.licenseUrl) !==
        "https://creativecommons.org/publicdomain/zero/1.0"
    )
      throw new Error(`License URL mismatch: ${asset.id}`);
    if (
      asset.license === "CC-BY-4.0" &&
      canonicalUrl(asset.licenseUrl) !==
        "https://creativecommons.org/licenses/by/4.0"
    )
      throw new Error(`License URL mismatch: ${asset.id}`);
    if (asset.verifiedAt > today || asset.addedAt > today)
      throw new Error(`Future verification date: ${asset.id}`);
    if (asset.addedAt > asset.verifiedAt)
      throw new Error(`Unverified addition: ${asset.id}`);
    if (asset.previewProvenance.license !== asset.license)
      throw new Error(`Preview license mismatch: ${asset.id}`);
  }
  return assets;
}

/** A displayed verification date must be supported by a real recorded check. */
export function validateEvidenceDate(
  verifiedAt: string,
  evidence: { checkedAt?: unknown; lastLinkCheckAt?: unknown },
  now = Date.now(),
) {
  const parse = (value: unknown) => {
    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    )
      throw new Error("Evidence needs a UTC verification timestamp");
    const timestamp = Date.parse(value);
    if (
      !Number.isFinite(timestamp) ||
      new Date(timestamp).toISOString().slice(0, 19) !== value.slice(0, 19) ||
      timestamp > now
    )
      throw new Error("Invalid or future evidence timestamp");
    return timestamp;
  };
  const original = parse(evidence.checkedAt);
  const latest =
    evidence.lastLinkCheckAt === undefined
      ? original
      : parse(evidence.lastLinkCheckAt);
  if (latest < original) throw new Error("Recheck predates original evidence");
  const supportedDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(latest);
  if (verifiedAt !== supportedDate)
    throw new Error("Verification date does not match its evidence");
}
