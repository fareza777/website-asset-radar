import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { canonicalUrl } from "../lib/catalog-utils";
import type { Publisher } from "../lib/publishers";

/** Only an explicitly configured public index may be fetched by the watcher. */
export function isWatchUrl(publisher: Publisher, value: string) {
  if (publisher.watch.mode !== "public_index") return false;
  try {
    const url = new URL(value);
    const configured = new URL(publisher.watch.url);
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      url.host === configured.host && !url.search && !url.hash &&
      url.pathname.replace(/\/+$/, "") === configured.pathname.replace(/\/+$/, "");
  } catch { return false; }
}

function isProductLink(publisher: Publisher, url: URL) {
  const path = url.pathname.replace(/\/+$/, "");
  if (/\.(zip|rar|7z|fbx|glb|png|jpg|pdf)$/i.test(path)) return false;
  if (/^\/packages\/.+\/[a-z0-9-]+-\d+$/i.test(path) && url.host === "assetstore.unity.com") return true;
  if (/^\/listings\/[a-f0-9-]{36}$/i.test(path) && url.host === "www.fab.com") return true;
  if (url.host === "fab.com" && /^\/listings\/[a-f0-9-]{36}$/i.test(path)) return true;
  if (/^\/[a-z0-9-]+$/i.test(path) && ["ansimuz.itch.io", "pixelfrog-assets.itch.io", "kaylousberg.itch.io"].includes(url.host)) {
    return ({ ansimuz: "ansimuz.itch.io", "pixel-frog": "pixelfrog-assets.itch.io", kaykit: "kaylousberg.itch.io" } as Record<string, string>)[publisher.id] === url.host;
  }
  if (url.host !== new URL(publisher.catalogUrl).host) return false;
  if (publisher.id === "kenney") return /^\/assets\/[a-z0-9-]+$/.test(path);
  if (publisher.id === "quaternius") return /^\/packs\/[a-z0-9-]+\.html$/i.test(path);
  return /^\/(products|assets|game-assets|shop)\/[a-z0-9-]+$/i.test(path);
}

/** Index observations are candidates only: never infer price, license or packaging. */
export function readPublisherIndex(html: string, publisher: Publisher) {
  const $ = cheerio.load(html);
  const links = new Map<string, { url: string; title: string }>();
  $("a[href]").each((_, element) => {
    const anchor = $(element);
    try {
      const observed = new URL(anchor.attr("href")!, publisher.watch.url);
      if (observed.protocol !== "https:" || observed.username || observed.password || observed.port || !isProductLink(publisher, observed)) return;
      const url = canonicalUrl(observed.toString());
      const title = anchor.text().replace(/\s+/g, " ").trim().slice(0, 180);
      if (!links.has(url) || title) links.set(url, { url, title });
    } catch { /* Ignore malformed links, never repair or guess them. */ }
  });
  $("script,style,nav,footer,form,noscript").remove();
  const text = ($("main").length ? $("main").text() : $("body").text()).replace(/\s+/g, " ").trim();
  return { links: [...links.values()].sort((a, b) => a.url.localeCompare(b.url)), fingerprint: createHash("sha256").update(text).digest("hex") };
}
