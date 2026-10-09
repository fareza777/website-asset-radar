import robotsParser from "robots-parser";
import { isOpenGameArtProductUrl, isOpenGameArtIndexUrl, isOpenGameArtDownloadUrl } from "../lib/free-source-urls";

export const userAgent =
  "AssetRadar/1.0 (+https://github.com/fareza777/website-asset-radar)";
const robotsCache = new Map<string, string>();
const lastRequests = new Map<string, number>();
let downloadAllowance = Infinity;
let downloadedBytes = 0;

/** Shared across in-process import batches; streamed responses stay bounded too. */
export function setDownloadBudget(maxBytes: number) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1)
    throw new Error("Download budget must be a positive byte count");
  downloadAllowance = maxBytes;
  downloadedBytes = 0;
}
export function getDownloadedBytes() { return downloadedBytes; }

export function isPermittedUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.port || url.username || url.password)
    return false;
  if (url.hostname === "opengameart.org")
    return isOpenGameArtProductUrl(value) || isOpenGameArtIndexUrl(value) || isOpenGameArtDownloadUrl(value);
  if (url.hostname === "kenney.nl")
    return (
      /^\/assets(?:\/|$)/.test(url.pathname) ||
      /^\/media\/pages\/assets\/[^/]+\/[^/]+\/[^/]+\.zip$/.test(url.pathname) ||
      ["/support", "/terms-of-service", "/robots.txt"].includes(url.pathname)
    );
  if (url.hostname === "api.polyhaven.com")
    return /^\/(assets|info\/[a-z0-9_]+|files\/[a-z0-9_]+|robots\.txt)$/.test(
      url.pathname,
    );
  if (url.hostname === "polyhaven.com")
    return (
      /^\/a\/[a-z0-9_]+$/.test(url.pathname) ||
      ["/license", "/robots.txt"].includes(url.pathname)
    );
  if (url.hostname === "dl.polyhaven.org")
    return (
      url.pathname.startsWith("/file/ph-assets/Textures/") ||
      url.pathname === "/robots.txt"
    );
  if (url.hostname === "ambientcg.com")
    return url.pathname === "/api/v2/full_json" ||
      /^\/a\/[A-Za-z0-9]+$/.test(url.pathname) ||
      (url.pathname === "/view" && /^[A-Za-z0-9]+$/.test(url.searchParams.get("id") ?? ""));
  if (url.hostname === "docs.ambientcg.com")
    return url.pathname === "/license/";
  if (url.hostname === "acg-media.struffelproductions.com")
    return /^\/file\/ambientCG-Web\/media\/thumbnail\/(512|1024)-(WEBP|PNG)\/[A-Za-z0-9]+\.(webp|png)$/.test(url.pathname);
  return false;
}

export function robotsAllows(text: string, url: string): boolean {
  return (
    robotsParser(`${new URL(url).origin}/robots.txt`, text).isAllowed(
      url,
      "AssetRadar",
    ) !== false
  );
}

export async function readLimitedResponse(
  response: Response,
  maxBytes: number,
  onBytes?: (size: number) => void,
): Promise<Response> {
  if (Number(response.headers.get("content-length")) > maxBytes) {
    await response.body?.cancel();
    throw new Error("Source response exceeds the permitted size");
  }
  if (!response.body) return response;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onBytes?.(value.byteLength);
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error("Source response exceeds the permitted size");
    }
    chunks.push(value);
  }
  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.set("content-length", String(size));
  return new Response(new Uint8Array(Buffer.concat(chunks)), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function throttle(host: string, crawlDelay = 0) {
  const interval = Math.max(1400, crawlDelay * 1000);
  const wait = Math.max(0, interval - (Date.now() - (lastRequests.get(host) || 0)));
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequests.set(host, Date.now());
}

async function getRobots(origin: string) {
  if (robotsCache.has(origin)) return robotsCache.get(origin)!;
  await throttle(new URL(origin).hostname);
  const response = await fetch(`${origin}/robots.txt`, {
    headers: { "User-Agent": userAgent },
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
  });
  if (response.status === 404 || response.status === 410) {
    robotsCache.set(origin, "");
    return "";
  }
  if (!response.ok)
    throw new Error(
      `Cannot establish robots policy for ${origin}: ${response.status}`,
    );
  const text = await (await readLimitedResponse(response, 200_000)).text();
  if (/<!doctype html|<html[\s>]/i.test(text))
    throw new Error(`Cannot establish robots policy for ${origin}: HTML challenge`);
  robotsCache.set(origin, text);
  return text;
}

/** Allowlisted, paced requests. Redirects cannot escape the original host. */
export async function fetchPermitted(
  value: string,
  options: { method?: "GET" | "HEAD"; maxBytes?: number } = {},
): Promise<Response> {
  if (!isPermittedUrl(value))
    throw new Error(`Source is outside the allowlist: ${value}`);
  let url = new URL(value);
  // Poly Haven explicitly permits the public API and asset-download endpoint. Its website is never scraped for discovery.
  if (
    url.hostname === "polyhaven.com" &&
    url.pathname.startsWith("/a/") &&
    options.method !== "HEAD"
  )
    throw new Error(
      "Poly Haven asset pages may be link-checked with HEAD only; use the API for metadata",
    );
  if (url.hostname === "ambientcg.com" && !url.pathname.startsWith("/api/") && options.method !== "HEAD")
    throw new Error("ambientCG discovery uses its documented API, not website scraping");
  for (let attempt = 0; attempt < 4; attempt++) {
    let crawlDelay = 0;
    if (["kenney.nl", "opengameart.org"].includes(url.hostname)) {
      const policy = robotsParser(`${url.origin}/robots.txt`, await getRobots(url.origin));
      if (policy.isAllowed(url.toString(), "AssetRadar") === false)
        throw new Error(`Robots policy disallows ${url}`);
      crawlDelay = policy.getCrawlDelay("AssetRadar") ?? 0;
      if (crawlDelay > 30) throw new Error("Robots crawl delay exceeds the supported interval; defer this source");
    }
    await throttle(url.hostname, crawlDelay);
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: { "User-Agent": userAgent },
      redirect: "manual",
      signal: AbortSignal.timeout(60000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Redirect missing its destination");
      const next = new URL(location, url);
      if (next.hostname !== url.hostname || !isPermittedUrl(next.toString()))
        throw new Error("Redirect escaped the permitted source");
      url = next;
      continue;
    }
    if (!response.ok || response.headers.get("cf-mitigated") === "challenge") {
      await response.body?.cancel();
      const protectedSource = [401, 403, 429].includes(response.status) ||
        response.headers.get("cf-mitigated") === "challenge";
      throw new Error(`${response.status}: ${url}${protectedSource ? "; stop on source protection" : ""}`);
    }
    if (options.method === "HEAD") return response;
    const isDownload = url.hostname === "dl.polyhaven.org" ||
      url.hostname === "acg-media.struffelproductions.com" ||
      isOpenGameArtDownloadUrl(url.toString()) ||
      /\.zip$/i.test(url.pathname);
    const maxBytes = Math.min(options.maxBytes ?? 8_000_000, isDownload ? downloadAllowance - downloadedBytes : Infinity);
    if (maxBytes < 1) { await response.body?.cancel(); throw new Error("Download budget exhausted"); }
    const limited = await readLimitedResponse(response, maxBytes,
      isDownload ? (size) => { downloadedBytes += size; } : undefined);
    return limited;
  }
  throw new Error("Too many source redirects");
}
