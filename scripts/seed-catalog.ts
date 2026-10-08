/** Reproducible seed import. Only copies media contained in verified CC0 packs. */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { unzipSync } from "fflate";
import sharp from "sharp";
import { OggVorbisDecoder } from "@wasm-audio-decoders/ogg-vorbis";
import defaultSeeds from "../data/seed-assets.json";
import { categories, assetTypes, type Asset } from "../lib/types";
import { z } from "zod";
import { canonicalUrl } from "../lib/catalog-utils";
import { validateCatalog } from "../lib/catalog-schema";
import { fetchPermitted } from "./source-policy";
import { readKenneyEvidence } from "./verification";

const sha = (data: string | Uint8Array) =>
  createHash("sha256").update(data).digest("hex");
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
}).format(new Date());
const licenseUrl = "https://creativecommons.org/publicdomain/zero/1.0/";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(url: string) {
  return fetchPermitted(url, { maxBytes: 50_000_000 });
}

async function seed() {
  await mkdir(".cache", { recursive: true });
  await mkdir("public/previews", { recursive: true });
  await mkdir("public/audio", { recursive: true });
  await mkdir("data/evidence", { recursive: true });
  const input = process.argv
    .find((arg) => arg.startsWith("--input="))
    ?.slice(8);
  const seeds = z
    .array(
      z
        .object({
          slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          categories: z.array(z.enum(categories)).min(1),
          assetType: z.enum(assetTypes),
          summary: z.string().min(20).max(240),
          featured: z.boolean().optional(),
        })
        .strict(),
    )
    .max(input ? 5 : 100)
    .parse(input ? JSON.parse(await readFile(input, "utf8")) : defaultSeeds);
  let catalog: Asset[] = [];
  try {
    catalog = validateCatalog(
      JSON.parse(await readFile("data/assets.json", "utf8")),
    ) as Asset[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  for (const seed of seeds) {
    try {
      const sourceUrl = `https://kenney.nl/assets/${seed.slug}`;
      if (
        catalog.some(
          (item) =>
            item.id === `kenney-${seed.slug}` ||
            canonicalUrl(item.sourceUrl) === canonicalUrl(sourceUrl),
        )
      ) {
        console.log(`Existing asset retained: ${seed.slug}`);
        continue;
      }
      const html = await (await get(sourceUrl)).text();
      const $ = load(html);
      const verified = readKenneyEvidence(html);
      const title = verified.title;
      const zipUrl = verified.archiveUrl;
      const cachePath = `.cache/${seed.slug}-${sha(zipUrl).slice(0, 16)}.zip`;
      let zip: Uint8Array;
      try {
        await access(cachePath);
        zip = await readFile(cachePath);
      } catch {
        zip = new Uint8Array(await (await get(zipUrl)).arrayBuffer());
        await writeFile(cachePath, zip);
      }
      const files = unzipSync(zip);
      const licenseFile = Object.keys(files).find((name) =>
        /(^|\/)license\.txt$/i.test(name),
      );
      const licenseText = licenseFile
        ? new TextDecoder().decode(files[licenseFile])
        : "";
      if (!/Creative Commons Zero|CC0/i.test(licenseText))
        throw new Error("Archive license cannot be verified");
      const sample = Object.keys(files).find((name) =>
        /(^|\/)sample\.png$/i.test(name),
      );
      const preview = Object.keys(files).find((name) =>
        /(^|\/)preview\.png$/i.test(name),
      );
      const isAudio = seed.categories.includes("Audio");
      const chosen = isAudio
        ? Object.keys(files).find((n) => /^Audio\/.*\.ogg$/i.test(n))
        : sample ||
          preview ||
          Object.keys(files).find((n) => /controller_switch\.png$/i.test(n));
      if (!chosen) throw new Error("No licensed preview input");
      let previewNote =
        "Cropped and optimized from the preview included in the author's CC0 asset archive. Creator logos are not used as site branding.";
      if (isAudio) {
        const decoder = new OggVorbisDecoder();
        await decoder.ready;
        const audio = await decoder.decodeFile(files[chosen]);
        decoder.free();
        if (!audio.samplesDecoded || audio.errors.length)
          throw new Error("Audio decoding failed");
        const channel = audio.channelData[0];
        const peaks = Array.from({ length: 86 }, (_, i) => {
          const start = Math.floor((i * channel.length) / 86),
            end = Math.floor(((i + 1) * channel.length) / 86);
          let peak = 0;
          for (let j = start; j < end; j++)
            peak = Math.max(peak, Math.abs(channel[j]));
          return peak;
        });
        const max = Math.max(...peaks, 0.01);
        const bars = peaks
          .map((peak, i) => {
            const h = Math.max(5, (peak / max) * 160);
            return `<rect x="${58 + i * 8}" y="${222 - h / 2}" width="4" height="${h}" rx="2" fill="#b5f0cf" opacity="${0.55 + (peak / max) * 0.45}"/>`;
          })
          .join("");
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="800" height="450" fill="#203028"/><circle cx="680" cy="55" r="145" fill="none" stroke="#45664f"/><circle cx="680" cy="55" r="105" fill="none" stroke="#45664f"/><text x="58" y="72" fill="#a3c9b0" font-family="Arial" font-size="13" letter-spacing="3">AUDIO / ${seed.assetType === "Music" ? "MUSIC" : "SOUND EFFECTS"}</text>${bars}<text x="58" y="382" fill="#e0f4e8" font-family="Arial" font-size="26">${title}</text><text x="58" y="411" fill="#9cbdab" font-family="Arial" font-size="12">Waveform of ${chosen.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</text></svg>`;
        await sharp(Buffer.from(svg))
          .webp({ quality: 86 })
          .toFile(`public/previews/kenney-${seed.slug}.webp`);
        await writeFile(`public/audio/kenney-${seed.slug}.ogg`, files[chosen]);
        previewNote =
          "Original waveform visualization measured from the decoded CC0 audio sample named in this record. The audio preview is one sound, not the complete pack.";
      } else {
        const img = sharp(files[chosen]);
        const meta = await img.metadata();
        const height =
          sample || preview
            ? Math.floor((meta.height || 512) * 0.86)
            : meta.height || 512;
        await img
          .extract({ left: 0, top: 0, width: meta.width || 918, height })
          .resize(800, 450, {
            fit: sample || preview ? "cover" : "contain",
            background: "#243229",
            kernel: seed.assetType === "Tilesets" ? "nearest" : "lanczos3",
          })
          .webp({ quality: 83 })
          .toFile(`public/previews/kenney-${seed.slug}.webp`);
        if (seed.slug === "nature-kit")
          await sharp(files[chosen])
            .extract({ left: 75, top: 0, width: 760, height: 442 })
            .resize(1200)
            .webp({ quality: 87 })
            .toFile("public/previews/hero-nature.webp");
        if (!sample && !preview)
          previewNote =
            "Preview of an actual CC0 controller graphic from the asset archive, optimized against an original background.";
      }
      const ext = new Set(
        Object.keys(files).map((name) => name.split(".").pop()?.toUpperCase()),
      );
      const formats = [
        "PNG",
        "SVG",
        "FBX",
        "OBJ",
        "GLB",
        "GLTF",
        "BLEND",
        "WAV",
        "OGG",
        "MP3",
      ].filter((x) => ext.has(x));
      const is3D = seed.assetType === "3D Models";
      const tags = $("tr")
        .filter((_, tr) => $(tr).find("td").first().text().trim() === "Tags")
        .find("a")
        .map((_, a) => $(a).text().trim())
        .get();
      const countText = $("tr")
        .filter((_, tr) => $(tr).find("td").first().text().trim() === "Files")
        .find("td")
        .last()
        .text();
      const fileCount = Number.parseInt(countText.replace(/[^\d]/g, ""), 10);
      const evidence = `${title}; License: Creative Commons CC0; free download confirmed on the source page and in ${licenseFile}.`;
      const item: Asset = {
        id: `kenney-${seed.slug}`,
        title,
        author: "Kenney",
        summary: seed.summary,
        categories: seed.categories as Asset["categories"],
        dimension: isAudio ? "Audio" : is3D ? "3D" : "2D",
        assetType: seed.assetType as Asset["assetType"],
        source: "Kenney",
        sourceUrl,
        license: "CC0",
        licenseUrl,
        verificationUrl: sourceUrl,
        verifiedAt: today,
        addedAt: today,
        evidence,
        evidenceSha256: sha(html),
        formats,
        engines: isAudio
          ? ["Unity", "Godot", "GameMaker", "Unreal"]
          : is3D
            ? ["Unity", "Godot", "Unreal"]
            : ["Unity", "Godot", "Unreal", "GameMaker"],
        engineNote:
          "Engine filters indicate standard file formats that can be imported. These are raw assets, not official engine integrations or ready-made projects; setup or conversion may be required.",
        tags: tags.length ? tags : [seed.slug.replaceAll("-", " ")],
        ...(fileCount ? { fileCount } : {}),
        preview: `/previews/kenney-${seed.slug}.webp`,
        ...(isAudio ? { audioPreview: `/audio/kenney-${seed.slug}.ogg` } : {}),
        previewProvenance: {
          url: zipUrl,
          file: chosen,
          license: "CC0",
          sha256: sha(files[chosen]),
          note: previewNote,
        },
        featured: "featured" in seed && seed.featured === true,
      };
      validateCatalog([...catalog, item]);
      catalog.push(item);
      await writeFile(
        `data/evidence/${item.id}.json`,
        JSON.stringify(
          {
            sourceUrl,
            checkedAt: new Date().toISOString(),
            httpStatus: 200,
            pageSha256: sha(html),
            archiveUrl: zipUrl,
            archiveSha256: sha(zip),
            licenseFile,
            licenseText,
            previewFile: chosen,
            previewSha256: sha(files[chosen]),
            formats,
            sourceTags: tags,
          },
          null,
          2,
        ) + "\n",
      );
      await writeFile(
        "data/assets.json",
        JSON.stringify(catalog, null, 2) + "\n",
      );
      console.log(
        `Verified ${title}: ${fileCount || "unknown"} files, ${formats.join(", ")}`,
      );
    } catch (err) {
      console.error(`SKIPPED ${seed.slug}: ${(err as Error).message}`);
      process.exitCode = 1;
    }
    await sleep(1400);
  }
  console.log(`Seed complete: ${catalog.length} verified assets.`);
}

seed().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
