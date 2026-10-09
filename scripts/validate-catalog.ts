import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { validateCatalog, validateEvidenceDate } from "../lib/catalog-schema";
import type { Collection } from "../lib/types";
import { validateOffers, validateOfferEvidence } from "../lib/offers";
import type { ArchivedOffer } from "../lib/types";
import { validateExchangeRates } from "../lib/exchange-rates";

async function main() {
  validateExchangeRates(JSON.parse(await readFile("data/exchange-rates.json", "utf8")));
  const assets = validateCatalog(
    JSON.parse(await readFile("data/assets.json", "utf8")),
  );
  const root = path.resolve("public");
  for (const asset of assets) {
    for (const file of [asset.preview, asset.audioPreview].filter(
      (x): x is string => Boolean(x),
    )) {
      const local = path.resolve(root, `.${file}`);
      if (!local.startsWith(root + path.sep))
        throw new Error("Unsafe media path");
      const fileStat = await stat(local);
      if (
        !fileStat.isFile() ||
        fileStat.size < 100 ||
        fileStat.size > 2_000_000
      )
        throw new Error(`Invalid or oversized media: ${asset.id}`);
    }
    const evidence = JSON.parse(
      await readFile(`data/evidence/${asset.id}.json`, "utf8"),
    );
    validateEvidenceDate(asset.verifiedAt, evidence);
    if (asset.lastChecked !== (evidence.lastLinkCheckAt ?? evidence.checkedAt))
      throw new Error(`Last checked does not match evidence: ${asset.id}`);
    if (
      evidence.sourceUrl !== asset.sourceUrl ||
      evidence.httpStatus !== 200 ||
      (evidence.pageSha256 || evidence.apiSha256) !== asset.evidenceSha256
    )
      throw new Error(`Missing or inconsistent evidence: ${asset.id}`);
    if (
      (evidence.previewSha256 || evidence.assetFileSha256) !==
      asset.previewProvenance.sha256
    )
      throw new Error(`Preview provenance mismatch: ${asset.id}`);
    if (
      asset.source === "Kenney" &&
      !/Creative Commons Zero|CC0/i.test(evidence.licenseText || "")
    )
      throw new Error(`Archive license missing: ${asset.id}`);
    if (
      asset.source === "Poly Haven" &&
      evidence.licenseEvidenceUrl !== "https://polyhaven.com/license"
    )
      throw new Error(`Global source license missing: ${asset.id}`);
    if (
      asset.source === "Kenney" &&
      new URL(asset.previewProvenance.url).hostname !== "kenney.nl"
    )
      throw new Error(`Preview origin mismatch: ${asset.id}`);
    if (
      asset.source === "Poly Haven" &&
      new URL(asset.previewProvenance.url).hostname !== "dl.polyhaven.org"
    )
      throw new Error(`Preview origin mismatch: ${asset.id}`);
  }
  const offers = JSON.parse(await readFile("data/offers.json", "utf8"));
  const archive = JSON.parse(
    await readFile("data/offer-archive.json", "utf8"),
  ) as ArchivedOffer[];
  const promotions = validateOffers(
    [...offers, ...archive.map((a) => a.offer)],
    assets,
  );
  for (const offer of promotions) {
    const proof = JSON.parse(
      await readFile(`data/offer-evidence/${offer.id}.json`, "utf8"),
    );
    validateOfferEvidence(offer, proof);
    if (offer.preview) {
      const file = await stat(path.join(root, offer.preview));
      if (!file.isFile() || file.size > 2_000_000)
        throw new Error(`Invalid offer thumbnail: ${offer.id}`);
    }
  }
  const collections = JSON.parse(
    await readFile("data/collections.json", "utf8"),
  ) as Collection[];
  const ids = new Set(assets.map((a) => a.id));
  const collectionIds = new Set<string>();
  for (const collection of collections) {
    if (collectionIds.has(collection.id) || !/^[a-z0-9-]+$/.test(collection.id))
      throw new Error("Invalid or duplicate collection id");
    collectionIds.add(collection.id);
    if (
      !ids.has(collection.cover) ||
      !collection.assetIds.length ||
      collection.assetIds.some((id) => !ids.has(id)) ||
      new Set(collection.assetIds).size !== collection.assetIds.length
    )
      throw new Error(`Invalid collection references: ${collection.id}`);
  }
  console.log(
    `Catalog valid: ${assets.length} free assets, ${offers.length} promotions, ${collections.length} collections; media and evidence present.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
