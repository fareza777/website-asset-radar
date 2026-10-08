import robotsParser from "robots-parser";
import { readLimitedResponse, userAgent } from "./source-policy";

const robots = new Map<string, Promise<string>>();
const lastRequest = new Map<string, number>();

/** Product, promotion and license pages only. No checkout, API or asset files. */
export function isPermittedOfferUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.port || url.username || url.password)
    return false;
  const host = url.hostname.replace(/^www\./, ""),
    path = url.pathname;
  if (host === "fab.com")
    return (
      /^\/listings\/[a-f0-9-]{36}\/?$/.test(path) ||
      ["/limited-time-free", "/eula"].includes(path)
    );
  if (host === "assetstore.unity.com")
    return (
      /^\/packages\/[^.]+$/.test(path) || ["/sale", "/sale/"].includes(path)
    );
  if (host === "unity.com") return path.startsWith("/legal/");
  if (/^[a-z0-9][a-z0-9-]*\.itch\.io$/.test(host))
    return (
      /^\/[a-z0-9][a-z0-9-]*\/?$/.test(path) &&
      !/^\/(download|checkout|purchase|login|dashboard|api|settings)\/?$/.test(
        path,
      )
    );
  if (host === "itch.io")
    return (
      /^\/s\/\d+\/[a-z0-9-]+\/?$/.test(path) || path === "/game-assets/on-sale"
    );
  if (host === "gamedevmarket.net")
    return (
      /^\/asset\/[a-z0-9-]+\/?$/.test(path) ||
      /^\/(terms-conditions|licenses|on-sale)\/?$/.test(path)
    );
  if (host === "kenney.nl")
    return /^\/assets(?:\/[a-z0-9-]+)?\/?$/.test(path) || path === "/support";
  if (host === "opengameart.org")
    return /^\/content\/[a-z0-9-]+\/?$/.test(path);
  if (host === "creativecommons.org")
    return /^\/(licenses|publicdomain)\/[a-z0-9.-]+\/[0-9.]+\/(?:legalcode(?:\.[a-z]+)?|deed(?:\.[a-z]+)?)?$/.test(
      path,
    );
  return false;
}

async function pace(origin: string, crawlDelay = 0) {
  const delay = Math.max(1500, crawlDelay * 1000);
  const wait = Math.max(
    0,
    delay - (Date.now() - (lastRequest.get(origin) ?? 0)),
  );
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequest.set(origin, Date.now());
}

function readRobots(origin: string) {
  const prior = robots.get(origin);
  if (prior) return prior;
  const request = loadRobots(origin);
  // A failed permission check is cached too: stop requesting that source.
  robots.set(origin, request);
  return request;
}

async function loadRobots(origin: string) {
  await pace(origin);
  const response = await fetch(`${origin}/robots.txt`, {
    headers: { "User-Agent": userAgent },
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
  });
  if (response.status === 404 || response.status === 410) {
    return "";
  }
  if (!response.ok || response.headers.get("cf-mitigated") === "challenge")
    throw new Error(
      `Robots policy unavailable (${response.status}); use source permission review`,
    );
  const limited = await readLimitedResponse(response, 200_000);
  const text = await limited.text();
  if (/<!doctype html|<html[\s>]/i.test(text))
    throw new Error(
      "Robots endpoint returned HTML; no automated requests permitted",
    );
  return text;
}

/** Read public evidence only when robots permits it; never bypass a challenge. */
export async function fetchPermittedOffer(
  value: string,
  options: { method?: "GET" | "HEAD" } = {},
): Promise<Response> {
  if (!isPermittedOfferUrl(value))
    throw new Error(`Offer URL outside the allowlist: ${value}`);
  let url = new URL(value);
  const originalHost = url.hostname;
  for (let attempt = 0; attempt < 4; attempt++) {
    const policy = robotsParser(
      `${url.origin}/robots.txt`,
      await readRobots(url.origin),
    );
    if (policy.isAllowed(url.toString(), "AssetRadar") === false)
      throw new Error("Robots excludes this page; do not scrape or bypass");
    const crawlDelay = policy.getCrawlDelay("AssetRadar") ?? 0;
    if (crawlDelay > 30)
      throw new Error(
        "Source requires a longer crawl interval; defer to permission review",
      );
    await pace(url.origin, crawlDelay);
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: { "User-Agent": userAgent },
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Source redirect has no destination");
      const next = new URL(location, url);
      if (
        next.hostname !== originalHost ||
        !isPermittedOfferUrl(next.toString())
      )
        throw new Error("Source redirected outside its permitted host or page");
      url = next;
      continue;
    }
    if (!response.ok || response.headers.get("cf-mitigated") === "challenge") {
      await response.body?.cancel();
      throw new Error(
        `Source unavailable (${response.status}); do not bypass protection`,
      );
    }
    if (options.method === "HEAD") return response;
    const limited = await readLimitedResponse(response, 2_000_000);
    if (/text\/html/i.test(limited.headers.get("content-type") ?? "")) {
      const text = await limited.clone().text();
      if (
        /<title>\s*(Just a moment|Access denied|Attention Required)/i.test(text)
      )
        throw new Error("Source returned a challenge; stop and report");
    }
    return limited;
  }
  throw new Error("Too many source redirects");
}
