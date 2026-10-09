import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import {
  promotionSchema,
  reconcileOffers,
  validateOffers,
  validateOfferEvidence,
  calculateRadarScore,
  calculateDiscount,
} from "../lib/offers";
import type { ArchivedOffer, OfferEvidence, Promotion } from "../lib/types";

async function main() {
  const now = Date.now(),
    write = process.argv.includes("--write");
  const free = JSON.parse(await readFile("data/assets.json", "utf8"));
  const current = validateOffers(
    z
      .array(promotionSchema)
      .parse(JSON.parse(await readFile("data/offers.json", "utf8")))
      .map((offer) => ({
        ...offer,
        discountPercent: calculateDiscount(
          offer.originalPrice,
          offer.salePrice,
        ),
        radarScore: calculateRadarScore(offer as Promotion),
      })),
    free,
    now,
  );
  const parsedArchive = z
    .array(
      z
        .object({
          offer: promotionSchema,
          reason: z.enum(["expired", "verification_required"]),
          archivedAt: z.iso.datetime(),
        })
        .strict(),
    )
    .parse(
      JSON.parse(await readFile("data/offer-archive.json", "utf8")),
    ) as ArchivedOffer[];
  const archive = parsedArchive.map((entry) => ({
    ...entry,
    offer: { ...entry.offer, radarScore: calculateRadarScore(entry.offer) },
  }));
  // Validate candidate IDs before using them to construct evidence file paths.
  const candidates = z
    .array(promotionSchema)
    .parse(
      JSON.parse(await readFile("data/offer-candidates.json", "utf8")),
    ) as Promotion[];
  const proofs = new Map<string, OfferEvidence>();
  for (const offer of [...current, ...candidates]) {
    const proof = JSON.parse(
      await readFile(`data/offer-evidence/${offer.id}.json`, "utf8"),
    ) as OfferEvidence;
    if (
      current.some((a) => a.id === offer.id) &&
      !candidates.some((a) => a.id === offer.id)
    )
      validateOfferEvidence(offer, proof, now);
    proofs.set(offer.id, proof);
  }
  const result = reconcileOffers(current, archive, candidates, proofs, now);
  validateOffers(
    [...result.active, ...result.archive.map((a) => a.offer)],
    free,
    now,
  );
  if (write) {
    // Validate the entire transaction before writing. Retry is idempotent.
    await writeFile(
      "data/offer-archive.json",
      JSON.stringify(result.archive, null, 2) + "\n",
    );
    await writeFile(
      "data/offers.json",
      JSON.stringify(result.active, null, 2) + "\n",
    );
    await writeFile("data/offer-candidates.json", "[]\n");
  }
  console.log(
    `${result.active.length} verified promotions; ${result.archive.length} archived. ${write ? "Catalog updated" : "Read-only validation"}. lastChecked comes only from recorded verification.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
