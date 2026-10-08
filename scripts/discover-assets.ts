import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { canonicalUrl } from "../lib/catalog-utils";
import { validateCatalog } from "../lib/catalog-schema";
import { fetchPermitted } from "./source-policy";
import { readKenneyEvidence } from "./verification";
import { discoveryLimit, readKenneyIndex } from "./discovery-utils";
import policy from "../data/automation-policy.json";

async function main() {
  const limit = discoveryLimit(process.argv.slice(2));
  const startedAt = Date.now();
  const deadline = startedAt + policy.maxRunMinutes * 60_000;
  const assets = validateCatalog(
    JSON.parse(await readFile("data/assets.json", "utf8")),
  );
  const existing = new Set(assets.map((a) => canonicalUrl(a.sourceUrl)));
  const seen = new Set<string>();
  const candidates: Record<string, unknown>[] = [];
  const failures: { url: string; reason: string }[] = [];
  const urls = new Set<string>();
  const pages = ["https://kenney.nl/assets"];
  const seenPages = new Set<string>();
  const kenneyLimit = Math.ceil(limit / 2);
  while (
    pages.length &&
    seenPages.size < policy.maxIndexPages &&
    Date.now() < deadline
  ) {
    const page = pages.shift()!;
    if (seenPages.has(page)) continue;
    seenPages.add(page);
    try {
      const index = readKenneyIndex(
        await (await fetchPermitted(page)).text(),
        page,
      );
      for (const url of index.products) {
        if (!existing.has(canonicalUrl(url))) urls.add(url);
      }
      for (const next of index.pages) {
        if (!seenPages.has(next) && !pages.includes(next)) pages.push(next);
      }
      if (urls.size >= kenneyLimit) break;
    } catch (error) {
      failures.push({ url: page, reason: (error as Error).message });
      // Stop this source on access/policy failures; preserve other-source discovery.
      break;
    }
  }
  let inspectedProducts = 0;
  for (const raw of urls) {
    const url = canonicalUrl(raw);
    if (existing.has(url) || seen.has(url)) continue;
    seen.add(url);
    if (inspectedProducts >= kenneyLimit || Date.now() >= deadline) break;
    inspectedProducts++;
    try {
      const page = await (await fetchPermitted(url)).text();
      const evidence = readKenneyEvidence(page);
      candidates.push({
        source: "Kenney",
        sourceUrl: url,
        title: evidence.title,
        license: evidence.license,
        licenseUrl: evidence.licenseUrl,
        archiveUrl: evidence.archiveUrl,
        pageSha256: createHash("sha256").update(page).digest("hex"),
        reviewRequired:
          "Inspect archive license and preview rights, factual metadata, duplicates, and appropriate categories before adding.",
      });
    } catch (error) {
      const reason = (error as Error).message;
      failures.push({ url, reason });
      if (
        /^(401|403|429):|robots|outside the allowlist|protection/i.test(reason)
      )
        break;
    }
  }
  try {
    const metadata = (await (
      await fetchPermitted("https://api.polyhaven.com/assets?type=textures")
    ).json()) as Record<
      string,
      { name: string; date_published: number; authors: Record<string, string> }
    >;
    for (const [slug, info] of Object.entries(metadata).sort(
      (a, b) => b[1].date_published - a[1].date_published,
    )) {
      if (!/^[a-z0-9_]+$/.test(slug)) continue;
      const sourceUrl = `https://polyhaven.com/a/${slug}`;
      if (existing.has(canonicalUrl(sourceUrl))) continue;
      if (candidates.length >= limit || Date.now() >= deadline) break;
      candidates.push({
        source: "Poly Haven",
        sourceUrl,
        title: info.name,
        authors: Object.keys(info.authors),
        apiUrl: `https://api.polyhaven.com/info/${slug}`,
        filesUrl: `https://api.polyhaven.com/files/${slug}`,
        licenseEvidenceUrl: "https://polyhaven.com/license",
        reviewRequired:
          "Verify the current published asset license and identity. Generate a preview from actual CC0 texture maps; never copy website example renders.",
      });
    }
  } catch (error) {
    failures.push({
      url: "https://api.polyhaven.com/assets?type=textures",
      reason: (error as Error).message,
    });
  }
  await mkdir(".cache", { recursive: true });
  await writeFile(
    ".cache/discovery-report.json",
    JSON.stringify(
      {
        discoveredAt: new Date().toISOString(),
        limits: { candidates: limit, indexPages: policy.maxIndexPages },
        visitedIndexPages: [...seenPages],
        inspectedKenneyProducts: inspectedProducts,
        candidates,
        failures,
        note: "Candidate discovery only. The catalog has not been modified, and these candidates are not yet fully verified.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Discovered ${candidates.length} unique candidates; ${failures.length} source failures. Review .cache/discovery-report.json.`,
  );
  if (failures.length) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
