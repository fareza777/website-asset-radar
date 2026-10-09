import { readFile, writeFile, mkdir, rename, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { OggVorbisDecoder } from "@wasm-audio-decoders/ogg-vorbis";
import { validateCatalog } from "../lib/catalog-schema";
import { enrichFreeAsset } from "../lib/free-metadata";
import { canonicalUrl } from "../lib/catalog-utils";
import type { AssetType, Category } from "../lib/types";
import { fetchPermitted, setDownloadBudget } from "./source-policy";
import policy from "../data/automation-policy.json";
import {
  readOpenGameArtEvidence,
  inspectOpenGameArtFiles,
  openGameArtCredit,
  selectOpenGameArtDownload,
} from "./opengameart-utils";

const sha = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");
const xml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export function classifyOpenGameArt(
  info: ReturnType<typeof readOpenGameArtEvidence>,
) {
  const text =
    `${info.title} ${info.tags.join(" ")} ${info.description}`.toLowerCase();
  const audio =
    info.artTypes.includes("Music") || info.artTypes.includes("Sound Effect");
  const texture = info.artTypes.includes("Texture");
  const detect = (value: string): AssetType | undefined => {
    if (/\bg?ui\b|interface|hud|button|panel/.test(value)) return "UI Kits";
    if (/tile|terrain|platformer|dungeon/.test(value)) return "Tilesets";
    if (/icon|potion|inventory|item[s]?\b|lantern/.test(value)) return "Icons";
    if (
      /character|monster|creature|enemy|warrior|dwarf|sprite animation/.test(
        value,
      )
    )
      return "Characters";
    if (/effect|explosion|particle|magic spell/.test(value)) return "VFX";
    if (
      /background|environment|landscape|tree|foliage|building|sky|backdrop/.test(
        value,
      )
    )
      return "Environments";
  };
  let assetType: AssetType;
  if (audio)
    assetType = info.artTypes.includes("Music") ? "Music" : "Sound Effects";
  else if (texture) assetType = "Textures";
  else {
    const observedType =
      detect(info.title.toLowerCase()) ??
      detect(info.tags.join(" ").toLowerCase()) ??
      detect(info.description.toLowerCase());
    if (!observedType)
      throw new Error("Asset classification needs editorial review");
    assetType = observedType;
  }
  const categories: Category[] = audio
    ? ["Audio"]
    : texture
      ? ["3D"]
      : assetType === "UI Kits" || assetType === "Icons"
        ? ["UI"]
        : /platform|side.?scroll/.test(text)
          ? ["Platformer"]
          : ["RPG"];
  if (
    !audio &&
    /rpg|fantasy|dungeon|medieval|potion/.test(text) &&
    !categories.includes("RPG")
  )
    categories.push("RPG");
  if (
    !audio &&
    /survival|zombie/.test(text) &&
    !categories.includes("Survival")
  )
    categories.push("Survival");
  return {
    assetType,
    categories,
    dimension: audio
      ? ("Audio" as const)
      : texture
        ? ("3D" as const)
        : ("2D" as const),
  };
}

async function previewImage(
  input: ReturnType<typeof inspectOpenGameArtFiles>,
  title: string,
  audio: boolean,
) {
  if (audio) {
    if (
      !/\.ogg$/i.test(input.previewFile) ||
      input.previewBytes.length > 2_000_000
    )
      throw new Error(
        "Audio needs a small licensed OGG input for a measured waveform",
      );
    const decoder = new OggVorbisDecoder();
    await decoder.ready;
    try {
      const decoded = await decoder.decodeFile(input.previewBytes);
      if (!decoded.samplesDecoded || decoded.errors.length)
        throw new Error("Audio decoding failed");
      const channel = decoded.channelData[0];
      const peaks = Array.from({ length: 80 }, (_, i) => {
        let peak = 0;
        for (
          let sample = Math.floor((i * channel.length) / 80);
          sample < Math.floor(((i + 1) * channel.length) / 80);
          sample++
        )
          peak = Math.max(peak, Math.abs(channel[sample]));
        return peak;
      });
      const max = Math.max(...peaks, 0.01);
      const bars = peaks
        .map((peak, i) => {
          const height = Math.max(4, (150 * peak) / max);
          return `<rect x="${64 + i * 8.5}" y="${220 - height / 2}" width="4" height="${height}" rx="2" fill="#b8edca"/>`;
        })
        .join("");
      return sharp(
        Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="800" height="450" fill="#203028"/><text x="64" y="76" fill="#b8edca" font-family="Arial" font-size="16" letter-spacing="3">AUDIO / OPENGAMEART</text>${bars}<text x="64" y="366" fill="#e3f3e8" font-family="Arial" font-size="25">${xml(title.slice(0, 48))}</text><text x="64" y="404" fill="#b8cdbf" font-family="Arial" font-size="14">Waveform measured from a licensed source file</text></svg>`,
        ),
      )
        .webp({ quality: 82 })
        .toBuffer();
    } finally {
      decoder.free();
    }
  }
  if (/\.ogg$/i.test(input.previewFile))
    throw new Error("Visual asset has no usable licensed image");
  const image = sharp(input.previewBytes, { limitInputPixels: 40_000_000 });
  const metadata = await image.metadata();
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 16 ||
    metadata.height < 16
  )
    throw new Error("Licensed preview input is too small or invalid");
  return image
    .resize(800, 450, {
      fit: "contain",
      background: "#e9e8df",
      kernel: "nearest",
    })
    .webp({ quality: 84 })
    .toBuffer();
}

export async function importOpenGameArt(sourceUrl: string) {
  const catalog = validateCatalog(
    JSON.parse(await readFile("data/assets.json", "utf8")),
  );
  const offers = JSON.parse(await readFile("data/offers.json", "utf8"));
  const archive = JSON.parse(await readFile("data/offer-archive.json", "utf8"));
  const identity = canonicalUrl(sourceUrl);
  if (
    [
      ...catalog,
      ...offers,
      ...archive.map((entry: { offer: { sourceUrl: string } }) => entry.offer),
    ].some(
      (item) =>
        canonicalUrl(item.canonicalSourceUrl ?? item.sourceUrl) === identity,
    )
  )
    return null;
  const html = await (await fetchPermitted(sourceUrl)).text();
  const info = readOpenGameArtEvidence(html, sourceUrl);
  const classification = classifyOpenGameArt(info);
  const downloadUrl = selectOpenGameArtDownload(
    info.downloadUrls,
    classification.assetType,
  );
  const bytes = new Uint8Array(
    await (
      await fetchPermitted(downloadUrl, { maxBytes: 25_000_000 })
    ).arrayBuffer(),
  );
  const input = inspectOpenGameArtFiles(
    bytes,
    downloadUrl,
    info.license,
    classification.assetType,
  );
  if (
    catalog.some(
      (item) => item.previewProvenance.sha256 === sha(input.previewBytes),
    )
  )
    throw new Error(
      "Identical preview content is already cataloged; possible mirrored asset needs review",
    );
  // Do not publish two differently titled URLs for the same inspected download.
  for (const item of catalog.filter((item) => item.source === "OpenGameArt")) {
    const evidence = JSON.parse(
      await readFile(`data/evidence/${item.id}.json`, "utf8"),
    );
    if (evidence.downloadSha256 === sha(bytes))
      throw new Error("Duplicate downloaded asset content");
  }
  const preview = await previewImage(
    input,
    info.title,
    classification.dimension === "Audio",
  );
  const checkedAt = new Date().toISOString();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date(checkedAt));
  const id = `oga-${new URL(sourceUrl).pathname.split("/").filter(Boolean).at(-1)}`;
  const item = enrichFreeAsset(
    {
      id,
      title: info.title,
      author: info.authors.join(", "),
      authors: info.authors,
      summary:
        `${info.title}: ${classification.assetType.toLowerCase()} by ${info.authors.join(", ")}. ${input.formats.join(" / ")} content verified from a free ${info.license} download. Import and set up in your project.`.slice(
          0,
          240,
        ),
      ...classification,
      source: "OpenGameArt",
      sourceUrl,
      license: info.license,
      licenseUrl: info.licenseUrl,
      attribution: openGameArtCredit(
        info,
        sourceUrl,
        classification.dimension === "Audio",
      ),
      verificationUrl: sourceUrl,
      verifiedAt: today,
      addedAt: today,
      evidence:
        "The submission's own author, license and asset-download fields were checked. Content formats and the licensed preview input were inspected in one actual download. Other files and in-engine behavior have not been tested.",
      evidenceSha256: sha(html),
      formats: input.formats,
      engines: [],
      engineNote:
        "Formats were inspected in an actual licensed asset download. Importable describes standard content files only. No native engine package, complete project, render pipeline or engine performance is verified; manual setup is required.",
      tags: info.tags.length
        ? info.tags.slice(0, 24)
        : [classification.assetType.toLowerCase()],
      preview: `/previews/${id}.webp`,
      previewProvenance: {
        url: downloadUrl,
        file: input.previewFile,
        license: info.license,
        sha256: sha(input.previewBytes),
        note:
          classification.dimension === "Audio"
            ? "Original waveform measured from the decoded licensed OGG file. No full audio track or asset archive is hosted."
            : "A representative licensed content image from the submission's downloadable asset file, resized and converted to WebP. This is not the website gallery image or a complete pack overview.",
      },
    },
    checkedAt,
  );
  validateCatalog([...catalog, item]);
  const evidence = {
    adapter: "opengameart-v1",
    id,
    sourceUrl,
    checkedAt,
    httpStatus: 200,
    pageSha256: sha(html),
    title: info.title,
    authors: info.authors,
    license: info.license,
    licenseUrl: info.licenseUrl,
    attribution: item.attribution,
    downloadUrls: info.downloadUrls,
    downloadUrl,
    downloadSha256: sha(bytes),
    formats: input.formats,
    inspectedFiles: input.inspectedFiles,
    licenseFiles: input.licenseFiles,
    previewFile: input.previewFile,
    previewSha256: sha(input.previewBytes),
    sourceTags: info.tags,
    artTypes: info.artTypes,
    formatEvidence:
      "Actual contents of the recorded asset download; other downloads were not inspected.",
  };
  await mkdir("public/previews", { recursive: true });
  await mkdir("data/evidence", { recursive: true });
  const mediaPath = `public${item.preview}`,
    proofPath = `data/evidence/${id}.json`;
  let mediaWritten = false,
    proofWritten = false;
  try {
    await writeFile(mediaPath, preview, { flag: "wx" });
    mediaWritten = true;
    await writeFile(proofPath, JSON.stringify(evidence, null, 2) + "\n", {
      flag: "wx",
    });
    proofWritten = true;
    await writeFile(
      "data/assets.json.tmp",
      JSON.stringify([...catalog, item], null, 2) + "\n",
    );
    await rename("data/assets.json.tmp", "data/assets.json");
  } catch (error) {
    // Leave the public catalog unchanged if an import cannot finish.
    await rm("data/assets.json.tmp", { force: true });
    if (mediaWritten) await rm(mediaPath, { force: true });
    if (proofWritten) await rm(proofPath, { force: true });
    throw error;
  }
  console.log(
    `Verified ${id}: ${info.license}, ${input.formats.join(", ")}; licensed download input.`,
  );
  return id;
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  const url = process.argv.find((arg) => arg.startsWith("--url="))?.slice(6);
  if (!url)
    throw new Error(
      "Provide an observed product --url=https://opengameart.org/content/...",
    );
  setDownloadBudget(policy.maxArchiveDownloadMegabytes * 1_000_000);
  importOpenGameArt(url).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
