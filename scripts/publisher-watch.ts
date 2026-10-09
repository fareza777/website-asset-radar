import { mkdir, readFile, writeFile } from "node:fs/promises";
import robotsParser from "robots-parser";
import policy from "../data/automation-policy.json";
import { publishers } from "../lib/publishers";
import type { Publisher } from "../lib/publishers";
import { canonicalUrl } from "../lib/catalog-utils";
import { isWatchUrl, readPublisherIndex } from "./publisher-watch-utils";
import { userAgent, readLimitedResponse } from "./source-policy";

type Check = { id: string; url: string; status: "checked" | "permission_review" | "blocked"; attemptedAt: string; checkedAt: string | null; httpStatus: number | null; fingerprint: string | null; productUrls: string[]; changed: boolean; note: string };

async function fetchIndex(publisher: Publisher) {
  const initial = new URL(publisher.watch.url);
  const request = (url: string | URL) => fetch(url, { headers: { "User-Agent": userAgent }, redirect: "manual", signal: AbortSignal.timeout(20_000) });
  const robots = await request(`${initial.origin}/robots.txt`);
  let robotsText = "";
  if (robots.ok) robotsText = await (await readLimitedResponse(robots, 512_000)).text();
  else if (![404, 410].includes(robots.status)) throw new Error(`Robots policy unavailable (${robots.status}); collection stopped.`);
  const parsed = robotsParser(`${initial.origin}/robots.txt`, robotsText);
  let url = initial;
  const delay = Math.max(1400, (parsed.getCrawlDelay("AssetRadar") ?? parsed.getCrawlDelay("*") ?? 0) * 1000);
  if (delay > 30_000) throw new Error("Published crawl delay exceeds this bounded watch run; review manually.");
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!isWatchUrl(publisher, url.toString()) || parsed.isAllowed(url.toString(), "AssetRadar") === false) throw new Error("Index URL is outside the configured policy or excluded by robots.");
    await new Promise((resolve) => setTimeout(resolve, delay));
    const response = await request(url);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Redirect has no location.");
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) throw new Error(`Index unavailable (${response.status}); no bypass attempted.`);
    if (!/text\/html/i.test(response.headers.get("content-type") ?? "")) throw new Error("Expected a public HTML index.");
    const html = await (await readLimitedResponse(response, 3_000_000)).text();
    if (/<title[^>]*>\s*(Just a moment|Access denied|Attention required)|cf-chl-|challenge-platform|id=["']captcha/i.test(html)) throw new Error("Source protection encountered; collection stopped.");
    return { html, httpStatus: response.status };
  }
  throw new Error("Too many redirects; collection stopped.");
}

async function main() {
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.slice(8)) : 50;
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error("Candidate batch size must be a positive safe integer.");
  const previous: { checks?: Check[] } = JSON.parse(await readFile("data/publisher-monitor.json", "utf8").catch(() => "{}"));
  const catalog = JSON.parse(await readFile("data/assets.json", "utf8"));
  const offers = JSON.parse(await readFile("data/offers.json", "utf8"));
  const archive = JSON.parse(await readFile("data/offer-archive.json", "utf8"));
  const existing = new Set([...catalog, ...offers, ...archive.map((item: { offer: { canonicalSourceUrl: string } }) => item.offer)].map((item) => canonicalUrl(item.canonicalSourceUrl ?? item.sourceUrl)));
  const checks: Check[] = [];
  type Candidate = { publisher: string; sourceUrl: string; observedTitle: string; newSinceLastCheck: boolean; note: string };
  const queues: Candidate[][] = [];
  const candidates: Candidate[] = [];
  const seen = new Set<string>();
  for (const publisher of publishers.slice(0, policy.maxPublishersPerDay)) {
    const prior = previous.checks?.find((check) => check.id === publisher.id);
    const check: Check = { id: publisher.id, url: publisher.watch.url, status: "permission_review", attemptedAt: new Date().toISOString(), checkedAt: prior?.checkedAt ?? null, httpStatus: null, fingerprint: prior?.fingerprint ?? null, productUrls: prior?.productUrls ?? [], changed: false, note: publisher.watch.note };
    if (publisher.watch.mode === "public_index") {
      try {
        const result = await fetchIndex(publisher);
        const index = readPublisherIndex(result.html, publisher);
        check.status = "checked";
        check.checkedAt = new Date().toISOString();
        check.httpStatus = result.httpStatus;
        check.changed = prior?.fingerprint ? prior.fingerprint !== index.fingerprint : false;
        check.fingerprint = index.fingerprint;
        check.productUrls = index.links.map((link) => link.url).slice(0, 150);
        check.note = "Public index observed. A changed fingerprint is a review signal, not verified pricing, license or release evidence.";
        const queue: Candidate[] = [];
        for (const link of index.links.slice(0, 150)) {
          if (existing.has(link.url) || seen.has(link.url)) continue;
          seen.add(link.url);
          queue.push({ publisher: publisher.id, sourceUrl: link.url, observedTitle: link.title, newSinceLastCheck: Boolean(prior && !prior.productUrls.includes(link.url)), note: "Unverified candidate: inspect exact product identity, price, license, formats and publisher credit before publication." });
        }
        queues.push(queue.sort((a, b) => Number(b.newSinceLastCheck) - Number(a.newSinceLastCheck)));
      } catch (error) {
        check.status = "blocked";
        check.note = (error as Error).message;
      }
    }
    checks.push(check);
  }
  // Round-robin prevents one large catalog from consuming every candidate slot.
  while (candidates.length < limit && queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      if (candidates.length >= limit) break;
      const candidate = queue.shift();
      if (candidate) candidates.push(candidate);
    }
  }
  const report = { generatedAt: new Date().toISOString(), candidateLimit: limit, checks, candidates, note: "Index checks never modify asset evidence, lastChecked, prices or licenses. All candidates require separate full verification. Permission-review sources are not fetched." };
  await mkdir(".cache", { recursive: true });
  await writeFile(".cache/publisher-watch-report.json", JSON.stringify(report, null, 2) + "\n");
  if (process.argv.includes("--write")) await writeFile("data/publisher-monitor.json", JSON.stringify({ generatedAt: report.generatedAt, checks }, null, 2) + "\n");
  console.log(`Publisher watch: ${checks.filter((check) => check.status === "checked").length} checked, ${checks.filter((check) => check.status === "permission_review").length} awaiting permission review, ${checks.filter((check) => check.status === "blocked").length} blocked; ${candidates.length} unverified candidates. See .cache/publisher-watch-report.json.`);
  if (checks.some((check) => check.status === "blocked")) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
