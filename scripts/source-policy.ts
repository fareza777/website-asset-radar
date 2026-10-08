import robotsParser from "robots-parser";

export const userAgent =
  "AssetRadar/1.0 (+https://github.com/fareza777/website-asset-radar)";
const robotsCache = new Map<string, string>();
const lastRequests = new Map<string, number>();

export function isPermittedUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.port || url.username || url.password)
    return false;
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

async function throttle(host: string) {
  const wait = Math.max(0, 1400 - (Date.now() - (lastRequests.get(host) || 0)));
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
  const text = await response.text();
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
    url.hostname === "kenney.nl" &&
    !robotsAllows(await getRobots(url.origin), value)
  )
    throw new Error(`Robots policy disallows ${value}`);
  if (
    url.hostname === "polyhaven.com" &&
    url.pathname.startsWith("/a/") &&
    options.method !== "HEAD"
  )
    throw new Error(
      "Poly Haven asset pages may be link-checked with HEAD only; use the API for metadata",
    );
  for (let attempt = 0; attempt < 4; attempt++) {
    await throttle(url.hostname);
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: { "User-Agent": userAgent },
      redirect: "manual",
      signal: AbortSignal.timeout(60000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect missing its destination");
      const next = new URL(location, url);
      if (next.hostname !== url.hostname || !isPermittedUrl(next.toString()))
        throw new Error("Redirect escaped the permitted source");
      if (
        next.hostname === "kenney.nl" &&
        !robotsAllows(await getRobots(next.origin), next.toString())
      )
        throw new Error("Redirect is disallowed by robots policy");
      url = next;
      continue;
    }
    if (!response.ok) throw new Error(`${response.status}: ${url}`);
    const maxBytes = options.maxBytes ?? 8_000_000;
    return options.method === "HEAD"
      ? response
      : readLimitedResponse(response, maxBytes);
  }
  throw new Error("Too many source redirects");
}
