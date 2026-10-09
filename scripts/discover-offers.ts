import { mkdir, readFile, writeFile } from "node:fs/promises";
import { load } from "cheerio";
import sources from "../data/offer-sources.json";
import { canonicalUrl } from "../lib/catalog-utils";
import { discoveryLimit } from "./discovery-utils";
import {
  fetchPermittedOffer,
  isPermittedOfferUrl,
} from "./offer-source-policy";
import { readItchPromotion } from "./offer-discovery-utils";

async function main() {
  const flags = process.argv.slice(2);
  const limit = discoveryLimit(
    flags.some((flag) => flag.startsWith("--limit="))
      ? flags
      : [...flags, "--limit=50"],
  );
  const inspect = flags.includes("--inspect");
  const existing = new Set<string>();
  for (const file of [
    "data/assets.json",
    "data/offers.json",
    "data/offer-archive.json",
  ]) {
    for (const row of JSON.parse(await readFile(file, "utf8"))) {
      const item = row.offer ?? row;
      existing.add(canonicalUrl(item.canonicalSourceUrl ?? item.sourceUrl));
    }
  }
  const candidates: {
    source: string;
    sourceUrl: string;
    priceObservation?: ReturnType<typeof readItchPromotion>;
    status: string;
    reason?: string;
  }[] = [];
  const seen = new Set<string>();
  const statuses = [];
  for (const source of sources) {
    if (source.automatedAccess === "permission_required") {
      statuses.push({
        source: source.source,
        status: "permission_required",
        reason: source.verification,
        evidenceUrl: source.permissionEvidenceUrl,
      });
      continue;
    }
    if (["Kenney", "OpenGameArt"].includes(source.source)) {
      statuses.push({
        source: source.source,
        status: "permanent_free_source",
        reason:
          "Do not invent paid original prices for an ordinary free directory.",
      });
      continue;
    }
    const sourceUrl = source.discoveryUrl;
    try {
      if (!isPermittedOfferUrl(sourceUrl))
        throw new Error(
          "No supported permitted discovery endpoint; no request made",
        );
      const html = await (await fetchPermittedOffer(sourceUrl)).text(),
        $ = load(html);
      for (const element of $("a[href]").toArray()) {
        let url: URL;
        try {
          url = new URL($(element).attr("href")!, sourceUrl);
        } catch {
          continue;
        }
        if (
          !isPermittedOfferUrl(url.href) ||
          !(
            /\.itch\.io$/.test(url.hostname) ||
            /^\/listings\//.test(url.pathname)
          )
        )
          continue;
        const identity = canonicalUrl(url.href);
        if (
          seen.has(identity) ||
          existing.has(identity) ||
          candidates.length >= limit
        )
          continue;
        seen.add(identity);
        candidates.push({
          source: source.source,
          sourceUrl: identity,
          status: "needs_product_license_price_verification",
        });
      }
      statuses.push({ source: source.source, status: "index_observed" });
    } catch (error) {
      statuses.push({
        source: source.source,
        status: "blocked",
        reason: (error as Error).message,
      });
    }
  }
  let inspected = 0;
  const blockedHosts = new Set<string>();
  if (inspect)
    for (const candidate of candidates) {
      if (candidate.source !== "itch.io") continue;
      const host = new URL(candidate.sourceUrl).hostname;
      if (blockedHosts.has(host)) {
        candidate.status = "skipped_protected_host";
        candidate.reason =
          "An earlier request to this creator host was blocked; no further request made.";
        continue;
      }
      inspected++;
      try {
        candidate.priceObservation = readItchPromotion(
          await (await fetchPermittedOffer(candidate.sourceUrl)).text(),
        );
        candidate.status = candidate.priceObservation
          ? "price_observed_needs_license_content_curation"
          : "no_matching_verified_price_reduction";
      } catch (error) {
        candidate.status = "blocked";
        candidate.reason = (error as Error).message;
        if (
          /\b(401|403|429)\b|robots|protection|outside the allowlist|source agreement/i.test(
            candidate.reason,
          )
        )
          blockedHosts.add(host);
      }
    }
  await mkdir(".cache", { recursive: true });
  await writeFile(
    ".cache/promotion-discovery-report.json",
    JSON.stringify(
      {
        discoveredAt: new Date().toISOString(),
        inspected,
        sources: statuses,
        candidates,
        note: "Candidate discovery only. No offer is published, licensed, scored or stamped current by this report. Exact product/license/content/curation verification remains required.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${candidates.length} unlisted promotion candidates; ${inspected} product price inspections. No catalog publication. See .cache/promotion-discovery-report.json.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
