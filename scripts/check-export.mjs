import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

const root = path.resolve("out");
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
const promotions = [
  ...JSON.parse(await readFile("data/offers.json", "utf8")),
  ...JSON.parse(await readFile("data/offer-archive.json", "utf8")).map(
    (entry) => entry.offer,
  ),
];
const promotionIds = new Set(promotions.map((offer) => offer.id));
let assetPages = 0;
for (const value of urls) {
  const url = new URL(value);
  const file = path.join(root, url.pathname, "index.html");
  const $ = load(await readFile(file, "utf8"));
  if (
    $('link[rel="canonical"]').attr("href") !== value ||
    !$('meta[name="description"]').attr("content") ||
    $("h1").length !== 1
  )
    throw new Error(
      `Missing canonical, description, or unique heading: ${url.pathname}`,
    );
  const social = $('meta[property="og:image"]').attr("content");
  if (!social || new URL(social).origin !== url.origin)
    throw new Error(`Missing local social preview: ${url.pathname}`);
  await stat(path.join(root, new URL(social).pathname));
  if (
    ["/", "/free-today/", "/deals/"].includes(url.pathname) ||
    promotionIds.has(url.pathname.split("/")[2])
  ) {
    if (
      $("a")
        .toArray()
        .some((element) =>
          /^(Claim Free|View Deal)$/.test($(element).text().trim()),
        )
    )
      throw new Error(
        `Static HTML must wait for the browser expiry check before advertising a claim: ${url.pathname}`,
      );
    const schemas = $("script[type='application/ld+json']")
      .toArray()
      .map((element) => $(element).text());
    if (schemas.some((value) => /"@type"\s*:\s*"Offer"/.test(value)))
      throw new Error(
        `A promotional price schema could outlive its expiry: ${url.pathname}`,
      );
  }
  if (url.pathname.startsWith("/asset/")) {
    const data = $("script[type='application/ld+json']")
      .toArray()
      .map((element) => JSON.parse($(element).text()))
      .find((item) => item["@type"] === "CreativeWork");
    if (
      !data?.license ||
      !data?.sameAs ||
      !data?.dateModified ||
      data.url !== value
    )
      throw new Error(`Missing asset structured evidence: ${url.pathname}`);
    assetPages++;
  }
}
for (const route of ["/free/", "/free-today/", "/deals/", "/collections/"])
  if (!urls.some((value) => new URL(value).pathname === route))
    throw new Error(`Missing discovery route: ${route}`);
const favorites = load(
  await readFile(path.join(root, "favorites/index.html"), "utf8"),
);
if (!favorites('meta[name="robots"]').attr("content")?.includes("noindex"))
  throw new Error("Favorites must remain noindex");
for (const file of [
  "robots.txt",
  "404.html",
  "og.jpg",
  "apple-icon.png",
  "icon.svg",
])
  await stat(path.join(root, file));
console.log(
  `Static SEO verified: ${urls.length} public pages, ${assetPages} asset pages, local social images, sitemap, robots, and private favorites metadata.`,
);
