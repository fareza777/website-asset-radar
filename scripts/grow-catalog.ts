import { readFile, writeFile, mkdir } from "node:fs/promises";
import { load } from "cheerio";
import policy from "../data/automation-policy.json";
import { canonicalUrl } from "../lib/catalog-utils";
import { validateCatalog } from "../lib/catalog-schema";
import type { AssetType, Category } from "../lib/types";
import {
  fetchPermitted,
  setDownloadBudget,
  getDownloadedBytes,
} from "./source-policy";
import { readKenneyIndex } from "./discovery-utils";
import { readKenneyEvidence } from "./verification";
import { fillGrowthQueue, type GrowthCandidate } from "./catalog-growth-utils";
import { seedKenney } from "./seed-catalog";
import { seedPolyHaven } from "./seed-polyhaven";
import { importAmbientCG } from "./ambientcg";
import { importOpenGameArt } from "./opengameart";
import { readOpenGameArtIndex } from "./opengameart-utils";

function integerFlag(
  name: string,
  fallback: number | null,
  minimum = 1,
  ceiling = Number.MAX_SAFE_INTEGER,
) {
  const flags = process.argv.filter((arg) => arg.startsWith(`--${name}=`));
  const value = flags.length
    ? Number(flags[0].slice(name.length + 3))
    : fallback;
  if (
    flags.length > 1 ||
    (value !== null &&
      (!Number.isSafeInteger(value) || value < minimum || value > ceiling))
  )
    throw new Error(`--${name} must be ${minimum} through ${ceiling}`);
  return value;
}

async function main() {
  const startedAt = Date.now();
  const modeFlags = process.argv.filter((arg) => arg.startsWith("--mode="));
  const mode = modeFlags[0]?.slice(7) ?? "daily";
  if (modeFlags.length > 1 || !["daily", "backfill"].includes(mode))
    throw new Error("Use --mode=daily or --mode=backfill");
  const write = process.argv.includes("--write");
  const backfill = mode === "backfill";
  // Old saved schedules used --limit=50 and --candidates=150. Accept those
  // flags without restoring the output quotas the owner explicitly removed.
  const legacyMinimum = integerFlag("limit", null);
  const legacyCandidateHint = integerFlag("candidates", null);
  if (
    legacyMinimum !== null &&
    process.argv.some((arg) => arg.startsWith("--minimum="))
  )
    throw new Error("Use --minimum or its legacy --limit alias, not both");
  const limit = policy.maxNewItemsPerRun;
  const maxCandidates = policy.maxCandidatesPerRun;
  const minimumRemaining = integerFlag(
    "minimum",
    legacyMinimum ?? policy.minimumNewItemsPerRun,
    0,
  )!;
  if (legacyMinimum !== null || legacyCandidateHint !== null)
    console.error(
      "Legacy growth flags: --limit now means minimum, and --candidates no longer caps inspections. Use --minimum and the actual time/download budget; growth has no item ceiling.",
    );
  const minuteCeiling = backfill
    ? policy.backfill.maxRunMinutes
    : policy.maxRunMinutes;
  const minutes = integerFlag("minutes", minuteCeiling, 1, minuteCeiling)!;
  if (minutes <= 10)
    throw new Error(
      "Reserve at least 10 minutes for validation and publication",
    );
  // Validation and publication are part of the outer scheduled run's time budget.
  const deadline = startedAt + (minutes - 10) * 60_000;
  const catalog = validateCatalog(
    JSON.parse(await readFile("data/assets.json", "utf8")),
  );
  const offers = JSON.parse(await readFile("data/offers.json", "utf8"));
  const archive = JSON.parse(await readFile("data/offer-archive.json", "utf8"));
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  const existing = new Set(
    [
      ...catalog,
      ...offers,
      ...archive.map(
        (item: { offer: { sourceUrl: string; canonicalSourceUrl?: string } }) =>
          item.offer,
      ),
    ].map((item) =>
      canonicalUrl(
        "canonicalSourceUrl" in item && item.canonicalSourceUrl
          ? item.canonicalSourceUrl
          : item.sourceUrl,
      ),
    ),
  );
  const todayIds = new Set(
    [
      ...catalog,
      ...offers,
      ...archive.map(
        (item: { offer: { id: string; addedAt: string } }) => item.offer,
      ),
    ]
      .filter((item) => item.addedAt === today)
      .map((item) => item.id),
  );
  const downloadAllowance =
    (backfill
      ? policy.backfill.maxDownloadMegabytes
      : policy.maxArchiveDownloadMegabytes) * 1_000_000;
  const downloadedBeforeThisRun = integerFlag(
    "downloaded-bytes",
    0,
    0,
    downloadAllowance,
  )!;
  const remainingDownloadBytes = downloadAllowance - downloadedBeforeThisRun;
  const plan = {
    mode,
    minimumNewItems: policy.minimumNewItemsPerRun,
    minimumRemaining,
    additionLimit: limit,
    inspectionLimit: maxCandidates,
    legacyCandidateHint,
    existingItems: catalog.length + offers.length + archive.length,
    addedBeforeThisRunToday: todayIds.size,
    minutes,
    remainingDownloadBytes,
  };
  if (process.argv.includes("--plan")) {
    console.log(JSON.stringify(plan));
    return;
  }
  const sources: {
    source: string;
    status: string;
    discovered: number;
    reason?: string;
  }[] = [];
  const candidates: GrowthCandidate[] = [];
  if (remainingDownloadBytes === 0) {
    await mkdir(".cache", { recursive: true });
    await writeFile(
      ".cache/growth-report.json",
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          ...plan,
          added: [],
          failures: [],
          inspected: 0,
          blocked: [],
          sources: [],
          downloadBytes: 0,
          totalRunDownloadBytes: downloadedBeforeThisRun,
          elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
          shortfall: minimumRemaining,
          stopReason: "download_budget",
          note: "The outer run's download allowance is exhausted. No records added or reverified.",
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      "Download allowance exhausted; no new imports. Earlier additions today never satisfy this run's minimum.",
    );
    if (minimumRemaining) process.exitCode = 1;
    return;
  }
  setDownloadBudget(remainingDownloadBytes);
  // Enumerate each independent source; a failed source must not prevent the others.
  for (const source of ["OpenGameArt", "Kenney", "Poly Haven", "ambientCG"]) {
    const first = candidates.length;
    try {
      if (source === "OpenGameArt") {
        const pending = [
          "https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=9&sort_by=count&sort_order=DESC",
          "https://opengameart.org/latest",
        ];
        const seen = new Set<string>(), products = new Set<string>();
        const maxPages = backfill ? policy.backfill.maxIndexPages : policy.maxIndexPages;
        while (pending.length && seen.size < maxPages && Date.now() < deadline) {
          const url = pending.shift()!;
          if (seen.has(url)) continue;
          seen.add(url);
          const index = readOpenGameArtIndex(await (await fetchPermitted(url)).text(), url);
          index.products.forEach((product) => products.add(product));
          for (const page of index.pages)
            if (!seen.has(page) && !pending.includes(page)) pending.push(page);
        }
        for (const sourceUrl of products)
          if (!existing.has(canonicalUrl(sourceUrl))) candidates.push({source, sourceUrl, payload: null});
      } else if (source === "Kenney") {
        const pending = ["https://kenney.nl/assets"],
          seen = new Set<string>(),
          products = new Set<string>();
        const maxPages = backfill
          ? policy.backfill.maxIndexPages
          : policy.maxIndexPages;
        while (
          pending.length &&
          seen.size < maxPages &&
          Date.now() < deadline
        ) {
          const url = pending.shift()!;
          if (seen.has(url)) continue;
          seen.add(url);
          const index = readKenneyIndex(
            await (await fetchPermitted(url)).text(),
            url,
          );
          index.products.forEach((product) => products.add(product));
          for (const page of index.pages)
            if (!seen.has(page) && !pending.includes(page)) pending.push(page);
        }
        for (const sourceUrl of products)
          if (!existing.has(canonicalUrl(sourceUrl)))
            candidates.push({
              source,
              sourceUrl,
              payload: new URL(sourceUrl).pathname.split("/").at(-1)!,
            });
      } else if (source === "Poly Haven") {
        const index = await (
          await fetchPermitted("https://api.polyhaven.com/assets?type=textures")
        ).json();
        for (const [slug, value] of Object.entries(index).sort(
          (a, b) =>
            Number((b[1] as { date_published: number }).date_published) -
            Number((a[1] as { date_published: number }).date_published),
        )) {
          if (!/^[a-z0-9_]+$/.test(slug)) continue;
          const sourceUrl = `https://polyhaven.com/a/${slug}`;
          if (!existing.has(canonicalUrl(sourceUrl)))
            candidates.push({
              source,
              sourceUrl,
              payload: { slug, name: (value as { name: string }).name },
            });
        }
      } else {
        // Popular backlog and latest releases are both real product inventory.
        const count = backfill ? 250 : 150;
        const wanted = maxCandidates ?? Infinity;
        for (
          let offset = 0;
          Date.now() < deadline && candidates.length - first < wanted;
          offset += count
        ) {
          const url = `https://ambientcg.com/api/v2/full_json?type=Material&sort=${backfill ? "Popular" : "Latest"}&limit=${count}&offset=${offset}&include=displayData`;
          const response = await (await fetchPermitted(url)).json();
          for (const value of response.foundAssets ?? []) {
            if (!/^[A-Za-z0-9]+$/.test(value.assetId)) continue;
            const sourceUrl = `https://ambientcg.com/a/${value.assetId}`;
            if (!existing.has(canonicalUrl(sourceUrl)))
              candidates.push({ source, sourceUrl, payload: value.assetId });
          }
          if (
            !response.foundAssets?.length ||
            offset + count >= response.numberOfResults
          )
            break;
        }
      }
      sources.push({
        source,
        status: "discovered",
        discovered: candidates.length - first,
      });
      console.log(
        `${source}: ${candidates.length - first} unlisted products queued for verification.`,
      );
    } catch (error) {
      sources.push({
        source,
        status: "blocked",
        discovered: candidates.length - first,
        reason: (error as Error).message,
      });
    }
  }
  await mkdir(".cache", { recursive: true });
  await writeFile(
    ".cache/growth-candidates.json",
    JSON.stringify(
      { at: new Date().toISOString(), ...plan, sources, candidates },
      null,
      2,
    ) + "\n",
  );
  if (!write) {
    console.log(
      `Read-only discovery: ${candidates.length} queued; minimum ${minimumRemaining} new verified items, addition limit ${limit ?? "none"}. Use --write to import.`,
    );
    return;
  }
  const result = await fillGrowthQueue(candidates, {
    target: limit,
    maxCandidates,
    deadline,
    downloadBudgetReached: () => getDownloadedBytes() >= remainingDownloadBytes,
    importCandidate: async (candidate) => {
      if (candidate.source === "OpenGameArt") return importOpenGameArt(candidate.sourceUrl);
      if (candidate.source === "ambientCG")
        return importAmbientCG(String(candidate.payload));
      if (candidate.source === "Poly Haven") {
        const { slug, name } = candidate.payload as {
          slug: string;
          name: string;
        };
        const summary = `A CC0 ${name.toLowerCase()} surface material with publisher-provided texture maps. Import the maps and assemble the material in your engine.`;
        return (await seedPolyHaven([{ slug, summary }]))[0] ?? null;
      }
      const slug = String(candidate.payload);
      const html = await (await fetchPermitted(candidate.sourceUrl)).text();
      const verified = readKenneyEvidence(html);
      const $ = load(html);
      const row = (name: string) =>
        $("tr")
          .filter((_, tr) => $(tr).find("td").first().text().trim() === name)
          .find("td")
          .last()
          .text()
          .replace(/\s+/g, " ")
          .trim();
      const category = row("Category") || row("Category/series");
      const tags = row("Tags").toLowerCase();
      const text = `${verified.title} ${category} ${tags}`.toLowerCase();
      const isAudio = /audio|sound|music/.test(category.toLowerCase());
      const is3D = /\b3d\b/i.test(category);
      const assetType: AssetType = isAudio
        ? /music/.test(text)
          ? "Music"
          : "Sound Effects"
        : is3D
          ? "3D Models"
          : /\bui\b|interface|button|panel/.test(text)
            ? "UI Kits"
            : /icon|input|control/.test(text)
              ? "Icons"
              : /particle|vfx|explosion/.test(text)
                ? "VFX"
                : /texture|pattern/.test(category.toLowerCase())
                  ? "Textures"
                  : /character|animal|creature/.test(text)
                    ? "Characters"
                    : "Tilesets";
      const categories: Category[] = isAudio
        ? ["Audio"]
        : is3D
          ? ["3D"]
          : assetType === "UI Kits" || assetType === "Icons"
            ? ["UI"]
            : /platform|jump/.test(text)
              ? ["Platformer"]
              : /survival|shooter|zombie/.test(text)
                ? ["Survival"]
                : /farm|city|town|tower|idle/.test(text)
                  ? ["Idle"]
                  : ["RPG"];
      if (
        /rpg|dungeon|medieval|fantasy/.test(text) &&
        !categories.includes("RPG")
      )
        categories.push("RPG");
      if (/survival/.test(text) && !categories.includes("Survival"))
        categories.push("Survival");
      const summary = `A free CC0 ${category || assetType.toLowerCase()} pack: ${verified.title}.${row("Files") ? ` The publisher lists ${row("Files")} files.` : ""} Includes standard asset files for use in your own game projects.`;
      const imported = await seedKenney([
        { slug, assetType, categories, summary: summary.slice(0, 240) },
      ]);
      if (imported.failures.length)
        throw new Error(imported.failures[0].reason);
      return imported.added[0] ?? null;
    },
  });
  const report = {
    checkedAt: new Date().toISOString(),
    ...plan,
    ...result,
    sources,
    downloadBytes: getDownloadedBytes(),
    totalRunDownloadBytes: downloadedBeforeThisRun + getDownloadedBytes(),
    elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
    shortfall: Math.max(0, minimumRemaining - result.added.length),
    unity: {
      status: "permission_required",
      reason:
        "Unity Asset Store Terms section 3.3 prohibits automated access without a separate agreement.",
      evidenceUrl: "https://unity.com/legal/as-terms",
    },
  };
  await writeFile(
    ".cache/growth-report.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    `Growth complete: ${result.added.length} verified additions (minimum ${minimumRemaining}, limit ${limit ?? "none"}); ${result.inspected} inspected; ${result.failures.length} rejected; ${report.shortfall} shortfall; stopped: ${result.stopReason}.`,
  );
  if (report.shortfall) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
