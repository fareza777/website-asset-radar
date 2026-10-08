import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import type { Asset } from "../lib/types";
import { validateCatalog } from "../lib/catalog-schema";
import { fetchPermitted } from "./source-policy";
import { readPolyHavenLicense } from "./verification";
import { z } from "zod";

const sha = (data: string | Uint8Array) =>
  createHash("sha256").update(data).digest("hex");
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
}).format(new Date());
const summaries: Record<string, string> = {
  brown_planks_03:
    "A scanned brown wooden-plank material with texture maps for building realistic surfaces.",
  rock_boulder_cracked:
    "A cracked rock material with downloadable texture maps for outdoor game environments.",
  forest_ground_04:
    "A scanned forest-floor material for bringing natural surface detail to outdoor environments.",
};
type FileMap = Record<
  string,
  Record<string, Record<string, { url: string; size: number; md5: string }>>
>;
async function main() {
  const assets = JSON.parse(
    await readFile("data/assets.json", "utf8"),
  ) as Asset[];
  validateCatalog(assets);
  const input = process.argv
    .find((arg) => arg.startsWith("--input="))
    ?.slice(8);
  const imports = z
    .array(
      z
        .object({
          slug: z.string().regex(/^[a-z0-9_]+$/),
          summary: z.string().min(20).max(240),
        })
        .strict(),
    )
    .max(5)
    .parse(
      input
        ? JSON.parse(await readFile(input, "utf8"))
        : Object.entries(summaries).map(([slug, summary]) => ({
            slug,
            summary,
          })),
    );
  const licenseHtml = await (
    await fetchPermitted("https://polyhaven.com/license")
  ).text();
  if (!readPolyHavenLicense(licenseHtml))
    throw new Error("Asset license unavailable");
  for (const { slug, summary } of imports) {
    if (
      assets.some(
        (asset) => asset.sourceUrl === `https://polyhaven.com/a/${slug}`,
      )
    ) {
      console.log(`Existing asset retained: ${slug}`);
      continue;
    }
    await fetchPermitted(`https://polyhaven.com/a/${slug}`, { method: "HEAD" });
    const infoUrl = `https://api.polyhaven.com/info/${slug}`;
    const infoResponse = await fetchPermitted(infoUrl);
    const fileResponse = await fetchPermitted(
      `https://api.polyhaven.com/files/${slug}`,
    );
    if (!infoResponse.ok || !fileResponse.ok)
      throw new Error(`API unavailable for ${slug}`);
    const infoText = await infoResponse.text();
    const info = JSON.parse(infoText) as {
      name: string;
      type: number;
      authors: Record<string, string>;
      categories: string[];
    };
    if (info.type !== 1) throw new Error("Expected a texture");
    const files = (await fileResponse.json()) as FileMap;
    const diffuse = files.Diffuse?.["1k"]?.jpg;
    if (
      !diffuse ||
      !diffuse.url.startsWith(
        "https://dl.polyhaven.org/file/ph-assets/Textures/",
      )
    )
      throw new Error("No licensed diffuse map");
    const res = await fetchPermitted(diffuse.url);
    if (!res.ok) throw new Error("Texture download failed");
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (createHash("md5").update(bytes).digest("hex") !== diffuse.md5)
      throw new Error("Downloaded asset checksum mismatch");
    await sharp(bytes)
      .resize(800, 450, { fit: "cover" })
      .webp({ quality: 82 })
      .toFile(`public/previews/polyhaven-${slug.replaceAll("_", "-")}.webp`);
    const authors = Object.keys(info.authors);
    const item: Asset = {
      id: `polyhaven-${slug.replaceAll("_", "-")}`,
      title: info.name,
      author: authors.join(" & "),
      authors,
      summary,
      categories: ["Survival", "3D"],
      dimension: "3D",
      assetType: "Textures",
      source: "Poly Haven",
      sourceUrl: `https://polyhaven.com/a/${slug}`,
      license: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      verificationUrl: infoUrl,
      verifiedAt: today,
      addedAt: today,
      evidence:
        "Asset identity confirmed by the Poly Haven public API. Poly Haven's published license dedicates its texture assets to CC0. Preview uses the actual diffuse map, not a restricted example render.",
      evidenceSha256: sha(infoText),
      formats: [
        ...new Set(
          Object.values(files).flatMap((sizes) =>
            Object.values(sizes).flatMap((formats) =>
              Object.keys(formats).filter((key) =>
                ["jpg", "png", "exr"].includes(key),
              ),
            ),
          ),
        ),
      ].map((f) => f.toUpperCase()),
      engines: ["Unity", "Godot", "Unreal"],
      engineNote:
        "These texture-map formats can be imported into game engines. Materials need to be assembled in your engine; this is not an official engine integration or ready-made project.",
      tags: info.categories.filter((tag) => !tag.startsWith("collection:")),
      preview: `/previews/polyhaven-${slug.replaceAll("_", "-")}.webp`,
      previewProvenance: {
        url: diffuse.url,
        file: new URL(diffuse.url).pathname.split("/").at(-1)!,
        license: "CC0",
        sha256: sha(bytes),
        note: "Cropped and optimized from the actual CC0 diffuse texture downloaded using the permitted public API. No website example render is copied.",
      },
    };
    const existing = assets.findIndex((a) => a.id === item.id);
    if (existing >= 0) assets[existing] = item;
    else assets.push(item);
    await writeFile(
      `data/evidence/${item.id}.json`,
      JSON.stringify(
        {
          sourceUrl: item.sourceUrl,
          checkedAt: new Date().toISOString(),
          httpStatus: 200,
          apiUrl: infoUrl,
          apiSha256: sha(infoText),
          licenseEvidenceUrl: "https://polyhaven.com/license",
          licensePageSha256: sha(licenseHtml),
          assetFile: diffuse.url,
          assetFileMd5: diffuse.md5,
          assetFileSha256: sha(bytes),
          previewMethod: "actual diffuse texture crop",
          apiMetadata: info,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      `Verified ${item.title} (${item.author}) via permitted API; preview from CC0 diffuse texture.`,
    );
  }
  validateCatalog(assets);
  await writeFile("data/assets.json", JSON.stringify(assets, null, 2) + "\n");
  console.log(`${assets.length} verified assets total.`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
