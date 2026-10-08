import { load } from "cheerio";
import { canonicalUrl } from "../lib/catalog-utils";

export function readKenneyEvidence(html: string) {
  const $ = load(html);
  const title = $("h1").first().text().trim();
  const licenseRow = $("tr").filter(
    (_, row) => $(row).find("td").first().text().trim() === "License",
  );
  const licenseUrl = licenseRow.find("a").first().attr("href");
  if (
    !title ||
    !licenseUrl ||
    canonicalUrl(licenseUrl) !==
      "https://creativecommons.org/publicdomain/zero/1.0"
  )
    throw new Error(
      "No unambiguous CC0 license in the asset's own license field",
    );
  const archiveUrl = $("a[href$='.zip']").first().attr("href");
  if (
    !archiveUrl ||
    !archiveUrl.startsWith("https://kenney.nl/media/pages/assets/")
  )
    throw new Error("No first-party free archive");
  return { title, license: "CC0" as const, licenseUrl, archiveUrl };
}

export function readPolyHavenLicense(html: string): boolean {
  const text = load(html)("body").text().replace(/\s+/g, " ");
  return /Our assets are all licensed as CC0/.test(text);
}
