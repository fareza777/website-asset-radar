import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import sharp from "sharp";
import { z } from "zod";
import { enrichFreeAsset } from "../lib/free-metadata";
import { validateCatalog } from "../lib/catalog-schema";
import { fetchPermitted, isPermittedUrl } from "./source-policy";

export const ambientLicenseUrl = "https://docs.ambientcg.com/license/";
const sha = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");
const include = "tagData,displayData,downloadData,mapData,imageData";
export const ambientInfoUrl = (id: string) =>
  `https://ambientcg.com/api/v2/full_json?id=${encodeURIComponent(id)}&include=${include}`;
const metadataSchema = z
  .object({
    assetId: z.string().regex(/^[A-Za-z0-9]+$/),
    dataType: z.literal("Material"),
    displayName: z.string().min(3).max(100),
    displayCategory: z.string().nullable().optional(),
    shortLink: z.url(),
    tags: z.array(z.string()).default([]),
    maps: z.array(z.string()).default([]),
    previewImage: z.record(z.string(), z.string()),
    downloadFolders: z.record(
      z.string(),
      z
        .object({
          downloadFiletypeCategories: z.record(
            z.string(),
            z
              .object({
                downloads: z.array(
                  z
                    .object({
                      attribute: z.string(),
                      fullDownloadPath: z.url(),
                      fileName: z.string(),
                    })
                    .passthrough(),
                ),
              })
              .passthrough(),
          ),
        })
        .passthrough(),
    ),
  })
  .passthrough();
export type AmbientMetadata = z.infer<typeof metadataSchema>;

export function readAmbientLicense(html: string) {
  const text = load(html)("body").text().replace(/\s+/g, " ");
  return (
    /All ambientCG assets are provided under the Creative Commons CC0 1\.0 Universal License/i.test(
      text,
    ) &&
    /applies to the downloadable asset files and the material preview renders/i.test(
      text,
    )
  );
}

export function readAmbientMetadata(input: unknown): AmbientMetadata {
  const value = metadataSchema.parse(input);
  if (value.shortLink !== `https://ambientcg.com/a/${value.assetId}`)
    throw new Error("ambientCG asset identity mismatch");
  const previewUrl =
    value.previewImage["512-WEBP"] ?? value.previewImage["512-PNG"];
  if (
    !previewUrl ||
    !isPermittedUrl(previewUrl) ||
    !new RegExp(`/512-(WEBP|PNG)/${value.assetId}\\.(webp|png)$`).test(
      new URL(previewUrl).pathname,
    )
  )
    throw new Error("ambientCG preview identity mismatch");
  if (!ambientFormats(value).length)
    throw new Error(
      "No explicit content format in ambientCG download attributes",
    );
  return value;
}

export function ambientFormats(value: AmbientMetadata) {
  const formats = new Set<string>();
  for (const folder of Object.values(value.downloadFolders))
    for (const category of Object.values(folder.downloadFiletypeCategories))
      for (const download of category.downloads) {
        const url = new URL(download.fullDownloadPath);
        if (
          url.origin !== "https://ambientcg.com" ||
          url.pathname !== "/get" ||
          url.searchParams.get("file") !== download.fileName
        )
          throw new Error("Untrusted ambientCG download identity");
        const format = download.attribute.match(
          /(?:^|-)(JPG|PNG|EXR|HDR)$/,
        )?.[1];
        if (format) formats.add(format);
      }
  return [...formats].sort();
}

let licenseEvidence: { html: string; hash: string } | undefined;
export async function importAmbientCG(id: string) {
  if (!/^[A-Za-z0-9]+$/.test(id)) throw new Error("Invalid ambientCG ID");
  const catalog = validateCatalog(
    JSON.parse(await readFile("data/assets.json", "utf8")),
  );
  const sourceUrl = `https://ambientcg.com/a/${id}`;
  if (catalog.some((asset) => asset.sourceUrl === sourceUrl)) return null;
  if (!licenseEvidence) {
    const html = await (await fetchPermitted(ambientLicenseUrl)).text();
    if (!readAmbientLicense(html))
      throw new Error(
        "ambientCG asset and preview license could not be established",
      );
    licenseEvidence = { html, hash: sha(html) };
  }
  const apiUrl = ambientInfoUrl(id);
  const raw = await (await fetchPermitted(apiUrl)).text();
  const response = z
    .object({ foundAssets: z.array(z.unknown()).length(1) })
    .parse(JSON.parse(raw));
  const info = readAmbientMetadata(response.foundAssets[0]);
  if (info.assetId !== id)
    throw new Error("ambientCG returned a different product");
  await fetchPermitted(sourceUrl, { method: "HEAD" });
  const previewUrl =
    info.previewImage["512-WEBP"] ?? info.previewImage["512-PNG"];
  if (!previewUrl) throw new Error("No explicitly licensed API-listed preview");
  const bytes = new Uint8Array(
    await (
      await fetchPermitted(previewUrl, { maxBytes: 2_000_000 })
    ).arrayBuffer(),
  );
  const image = sharp(bytes);
  const dimensions = await image.metadata();
  if (
    !dimensions.width ||
    !dimensions.height ||
    dimensions.width < 128 ||
    dimensions.height < 128
  )
    throw new Error("Invalid ambientCG preview image");
  const assetId = `ambientcg-${id.toLowerCase()}`;
  await mkdir("public/previews", { recursive: true });
  await mkdir("data/evidence", { recursive: true });
  await image
    .resize(800, 450, { fit: "contain", background: "#e8e6df" })
    .webp({ quality: 82 })
    .toFile(`public/previews/${assetId}.webp`);
  const checkedAt = new Date().toISOString();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date(checkedAt));
  const formats = ambientFormats(info);
  const maps = info.maps.slice(0, 6).join(", ");
  const category = info.displayCategory
    ? `${info.displayCategory.toLowerCase()} `
    : "";
  const asset = enrichFreeAsset(
    {
      id: assetId,
      title: info.displayName,
      author: "ambientCG",
      summary: `A CC0 ${category}material with ${formats.join(" / ")} downloads${maps ? ` and ${maps} maps` : ""}. Assemble the material in your engine.`,
      categories: ["3D"],
      dimension: "3D",
      assetType: "Textures",
      source: "ambientCG",
      sourceUrl,
      license: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      verificationUrl: apiUrl,
      verifiedAt: today,
      addedAt: today,
      evidence:
        "Identity and published content formats checked against the official ambientCG API. Its current license explicitly covers asset files and material preview renders. Full asset archives and engine performance have not been tested.",
      evidenceSha256: sha(raw),
      formats,
      engines: ["Unity", "Godot", "Unreal"],
      engineNote:
        "The official API explicitly lists image formats in download attributes. These can be imported as textures; materials require manual assembly. No native engine package, render pipeline or engine performance is verified.",
      tags: [...new Set([info.displayCategory ?? "material", ...info.tags])]
        .filter(Boolean)
        .slice(0, 24),
      preview: `/previews/${assetId}.webp`,
      previewProvenance: {
        url: previewUrl,
        file: new URL(previewUrl).pathname.split("/").at(-1)!,
        license: "CC0",
        sha256: sha(bytes),
        note: "Optimized official API-listed material preview render. ambientCG's license explicitly dedicates its material preview renders to CC0; no logo or unrelated website image is copied.",
      },
    },
    checkedAt,
  );
  validateCatalog([...catalog, asset]);
  await writeFile(
    `data/evidence/${assetId}.json`,
    JSON.stringify(
      {
        sourceUrl,
        checkedAt,
        httpStatus: 200,
        apiUrl,
        apiSha256: sha(raw),
        apiMetadata: info,
        licenseEvidenceUrl: ambientLicenseUrl,
        licensePageSha256: licenseEvidence.hash,
        previewFile: previewUrl,
        previewSha256: sha(bytes),
        formatEvidence:
          "Official API download attributes; full archives not inspected.",
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(
    "data/assets.json",
    JSON.stringify([...catalog, asset], null, 2) + "\n",
  );
  console.log(
    `Verified ${assetId}: ${formats.join(", ")}; licensed publisher render.`,
  );
  return assetId;
}
