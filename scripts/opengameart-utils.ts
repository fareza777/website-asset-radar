import { load } from "cheerio";
import { unzipSync } from "fflate";
import { z } from "zod";
import type { Asset, AssetType } from "../lib/types";
import { canonicalUrl } from "../lib/catalog-utils";
import {
  isOpenGameArtProductUrl,
  isOpenGameArtIndexUrl,
  isOpenGameArtDownloadUrl,
} from "../lib/free-source-urls";

const licenses = [
  {
    name: "CC0" as const,
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  {
    name: "CC-BY-4.0" as const,
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
  {
    name: "CC-BY-3.0" as const,
    url: "https://creativecommons.org/licenses/by/3.0/",
  },
];
const restrictions =
  /non[ -]?commercial|personal use only|all rights reserved|not for commercial|no redistribution|do not redistribute|fan[ -]?art|ripped (?:from|assets)/i;

export function readOpenGameArtIndex(html: string, pageUrl: string) {
  if (!isOpenGameArtIndexUrl(pageUrl))
    throw new Error("Untrusted OpenGameArt index");
  const $ = load(html),
    products = new Set<string>(),
    pages = new Set<string>();
  $(
    ".view-art .view-content .node-art .field-name-title a[href], .view-art .views-field-title a[href]",
  ).each((_, anchor) => {
    try {
      const url = new URL($(anchor).attr("href")!, pageUrl).toString();
      if (isOpenGameArtProductUrl(url)) products.add(canonicalUrl(url));
    } catch {
      /* Never guess a product path. */
    }
  });
  $(".pager a[href]").each((_, anchor) => {
    try {
      const url = new URL($(anchor).attr("href")!, pageUrl);
      url.hash = "";
      if (isOpenGameArtIndexUrl(url.toString())) pages.add(url.toString());
    } catch {
      /* Ignore malformed pagination. */
    }
  });
  return { products: [...products], pages: [...pages] };
}

export function readOpenGameArtEvidence(html: string, sourceUrl: string) {
  if (!isOpenGameArtProductUrl(sourceUrl))
    throw new Error("Untrusted OpenGameArt product");
  const $ = load(html);
  const submissions = $(".node-art.view-mode-full");
  if (submissions.length !== 1)
    throw new Error(
      "Expected one OpenGameArt submission, not a collection or index",
    );
  const node = submissions.first().clone();
  node.find("#comments,.comment,script,style,.field-name-collect").remove();
  const field = (name: string) => node.find(`.field-name-${name}`).first();
  const values = (name: string) =>
    field(name).find(".field-items").text().replace(/\s+/g, " ").trim();
  const title = field("title").text().replace(/\s+/g, " ").trim();
  if (title.length < 3 || title.length > 100)
    throw new Error("OpenGameArt title needs review");
  const authorField = field("field-art-authors").length
    ? field("field-art-authors")
    : field("author-submitter");
  const authors = authorField
    .find(".field-items a")
    .map((_, anchor) => $(anchor).text().trim())
    .get()
    .filter(Boolean);
  if (!authors.length || authors.some((name) => name.length < 2))
    throw new Error("OpenGameArt author evidence missing");
  // These creators already have primary-source importers. Avoid mirrored packs.
  if (
    authors.some((author) =>
      /^(kenney(?:\.nl)?|poly haven|ambientcg)$/i.test(author),
    )
  )
    throw new Error(
      "Prefer the existing primary-source importer; mirrored pack needs review",
    );
  const observed = field("field-art-licenses")
    .find("a[href]")
    .map((_, anchor) => {
      try {
        const url = new URL($(anchor).attr("href")!);
        if (url.protocol === "http:" && url.hostname === "creativecommons.org")
          url.protocol = "https:";
        return canonicalUrl(url.toString());
      } catch {
        return "";
      }
    })
    .get();
  const license = licenses.find((entry) =>
    observed.includes(canonicalUrl(entry.url)),
  );
  if (!license)
    throw new Error(
      "No supported license in the submission's own license field",
    );
  const description = values("body");
  const notice =
    values("field-art-attribution") || values("field-copyright-notice");
  if (restrictions.test(`${description} ${notice}`))
    throw new Error("Conflicting rights or third-party content needs review");
  const downloadUrls = field("field-art-files")
    .find("a[href]")
    .map((_, anchor) => {
      try {
        const url = new URL($(anchor).attr("href")!, sourceUrl).toString();
        return isOpenGameArtDownloadUrl(url) ? url : "";
      } catch {
        return "";
      }
    })
    .get()
    .filter(Boolean);
  if (!downloadUrls.length)
    throw new Error(
      "No supported first-party asset download in the file field",
    );
  const tags = field("field-art-tags")
    .find("a")
    .map((_, anchor) => $(anchor).text().trim())
    .get()
    .filter(Boolean);
  const artTypes = field("field-art-type")
    .find("a")
    .map((_, anchor) => $(anchor).text().trim())
    .get();
  if (
    !artTypes.some((type) =>
      ["2D Art", "Texture", "Music", "Sound Effect"].includes(type),
    )
  )
    throw new Error("This art type needs a supported preview/content adapter");
  return {
    title,
    authors: [...new Set(authors)],
    license: license.name,
    licenseUrl: license.url,
    attribution:
      notice ||
      `${title} by ${authors.join(", ")}. ${license.name}. ${sourceUrl}`,
    attributionNotice: notice || null,
    downloadUrls: [...new Set(downloadUrls)],
    tags,
    artTypes,
    description,
  };
}

export function openGameArtCredit(
  info: ReturnType<typeof readOpenGameArtEvidence>,
  sourceUrl: string,
  audio: boolean,
) {
  const credit = `${info.title} by ${info.authors.join(", ")}. ${info.license} (${info.licenseUrl}). ${sourceUrl} Preview resized and converted to WebP${audio ? "; original waveform visualization" : ""}.`;
  return info.attributionNotice
    ? `${info.attributionNotice} ${credit}`
    : credit;
}

export function assertOpenGameArtPageUnchanged(
  asset: Asset,
  downloadUrl: string,
  html: string,
) {
  const current = readOpenGameArtEvidence(html, asset.sourceUrl);
  if (
    current.title !== asset.title ||
    current.license !== asset.license ||
    current.licenseUrl !== asset.licenseUrl ||
    JSON.stringify(current.authors) !==
      JSON.stringify(asset.authors ?? [asset.author]) ||
    !current.downloadUrls.includes(downloadUrl) ||
    openGameArtCredit(current, asset.sourceUrl, asset.dimension === "Audio") !==
      asset.attribution
  )
    throw new Error(
      "OpenGameArt identity, license, attribution or download changed; editorial review needed",
    );
}

function previewPreference(name: string, assetType?: AssetType) {
  const value = decodeURIComponent(name).toLowerCase();
  let score = /sprite.?sheet|tile.?set|atlas/.test(value) ? 10 : 0;
  if (assetType === "Tilesets") {
    if (
      /tile|terrain|overworld|dungeon|environment|forest|landscape/.test(value)
    )
      score += 20;
    if (/font|glyph|swoosh|particle|effect|ui[_. /-]/.test(value)) score -= 30;
  }
  if (assetType === "Icons" && /icon|item|potion|inventory/.test(value))
    score += 20;
  if (
    assetType === "UI Kits" &&
    /gui|interface|hud|panel|window|button|cursor|dialog|menu/.test(value)
  )
    score += 30;
  if (
    assetType === "Environments" &&
    /background|landscape|panorama|sky|mountain|backdrop/.test(value)
  )
    score += 20;
  if (
    assetType === "Characters" &&
    /character|player|enemy|monster|walk|idle/.test(value)
  )
    score += 20;
  if (assetType === "Textures" && /diffuse|color|albedo|material/.test(value))
    score += 20;
  return score;
}

export function selectOpenGameArtDownload(
  urls: readonly string[],
  assetType: AssetType,
) {
  if (!urls.length || urls.some((url) => !isOpenGameArtDownloadUrl(url)))
    throw new Error("Untrusted OpenGameArt download choices");
  return [...urls].sort((a, b) => {
    const score = (url: string) => {
      const path = new URL(url).pathname;
      const tileSheet =
        assetType === "Tilesets" &&
        /\.(png|jpe?g|webp)$/i.test(path) &&
        /tile.?set|sprite.?sheet|atlas|basictiles|sheet[_.-]/i.test(path);
      return (
        (tileSheet ? 140 : /\.zip$/i.test(path) ? 100 : 0) +
        previewPreference(path, assetType)
      );
    };
    return score(b) - score(a);
  })[0];
}

/** Never extract to disk. Bound decompression before allocating file contents. */
export function inspectOpenGameArtFiles(
  bytes: Uint8Array,
  downloadUrl: string,
  license: string,
  assetType?: AssetType,
) {
  if (!isOpenGameArtDownloadUrl(downloadUrl))
    throw new Error("Untrusted OpenGameArt asset download");
  const isArchive = /\.zip$/i.test(new URL(downloadUrl).pathname);
  const fileName = decodeURIComponent(
    new URL(downloadUrl).pathname.split("/").at(-1)!,
  );
  let totalSize = 0,
    entries = 0;
  const files: Record<string, Uint8Array> = isArchive
    ? unzipSync(bytes, {
        filter: (file) => {
          if (
            ++entries > 5000 ||
            (totalSize += file.originalSize) > 100_000_000 ||
            file.originalSize > 25_000_000
          )
            throw new Error(
              "OpenGameArt archive exceeds the inspection budget",
            );
          if (
            file.name.startsWith("/") ||
            file.name.includes("\\") ||
            file.name.split("/").includes("..") ||
            /^[A-Za-z]:/.test(file.name)
          )
            throw new Error("Unsafe archive path");
          return /\.(png|jpe?g|webp|ogg|wav|mp3|svg|fbx|obj|glb|gltf|blend|txt|md)$/i.test(
            file.name,
          );
        },
      })
    : { [fileName]: bytes };
  for (const [name, data] of Object.entries(files)) {
    if (!/(license|copying|readme)[^/]*\.(txt|md)$/i.test(name)) continue;
    const text = new TextDecoder().decode(data);
    if (
      restrictions.test(text) ||
      (license === "CC0" &&
        /creativecommons\.org\/licenses\/by[/-]/i.test(text))
    )
      throw new Error("Conflicting archive license needs review");
    const declaredUrls = [
      ...text.matchAll(
        /https?:\/\/(?:www\.)?creativecommons\.org\/(?:licenses\/[a-z-]+\/[0-9.]+|publicdomain\/zero\/1\.0)\/?/gi,
      ),
    ].map((match) => canonicalUrl(match[0].replace(/^http:/i, "https:")));
    const declaredNames = [
      ...text.matchAll(/\bCC[- ]?BY[- ]?(\d\.\d)\b/gi),
    ].map((match) => `CC-BY-${match[1]}`);
    if (/\bCC[- ]?0\b|Creative Commons Zero/i.test(text))
      declaredNames.push("CC0");
    if (
      !declaredUrls.length &&
      declaredNames.length &&
      !declaredNames.includes(license)
    )
      throw new Error(
        "Archive license differs from the selected product license",
      );
    const selected = licenses.find((entry) => entry.name === license)!;
    if (
      declaredUrls.length &&
      !declaredUrls.includes(canonicalUrl(selected.url))
    )
      throw new Error(
        "Archive license differs from the selected product license",
      );
    if (
      !declaredUrls.length &&
      /CC[- ]?BY[- ]?(?:NC|SA)|GNU General Public License/i.test(text)
    )
      throw new Error("Unsupported archive license needs review");
  }
  const names = Object.keys(files).filter(
    (name) => files[name].length && !name.startsWith("__MACOSX/"),
  );
  const formats = [
    ...new Set(
      names.map((name) =>
        name.split(".").at(-1)!.toUpperCase().replace("JPEG", "JPG"),
      ),
    ),
  ]
    .filter((ext) =>
      [
        "PNG",
        "JPG",
        "WEBP",
        "SVG",
        "OGG",
        "WAV",
        "MP3",
        "FBX",
        "OBJ",
        "GLB",
        "GLTF",
        "BLEND",
      ].includes(ext),
    )
    .sort();
  const usable = names.filter(
    (name) =>
      !/(^|\/)(logo|banner|cover|preview|sample|screenshot|readme|license|branding)[^/]*(\/|\.)/i.test(
        name,
      ),
  );
  const images = usable
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .sort((a, b) => {
      return (
        previewPreference(b, assetType) - previewPreference(a, assetType) ||
        files[b].length - files[a].length ||
        a.localeCompare(b)
      );
    });
  const previewFile = images[0] ?? usable.find((name) => /\.ogg$/i.test(name));
  if (!previewFile)
    throw new Error(
      "No licensed content file usable as a preview; gallery previews are excluded",
    );
  return {
    formats,
    previewFile,
    previewBytes: files[previewFile],
    inspectedFiles: names.length,
    licenseFiles: names.filter((name) =>
      /(license|copying)[^/]*\.(txt|md)$/i.test(name),
    ),
  };
}

/** Validate source-specific evidence in addition to the common hash/date checks. */
export function validateOpenGameArtEvidence(asset: Asset, input: unknown) {
  const hash = z.string().regex(/^[a-f0-9]{64}$/);
  const proof = z
    .object({
      adapter: z.literal("opengameart-v1"),
      id: z.string(),
      sourceUrl: z.url(),
      title: z.string(),
      authors: z.array(z.string()).min(1),
      license: z.enum(["CC0", "CC-BY-3.0", "CC-BY-4.0"]),
      licenseUrl: z.url(),
      attribution: z.string().min(10),
      downloadUrl: z.url(),
      downloadUrls: z.array(z.url()).min(1),
      downloadSha256: hash,
      formats: z.array(z.string()).min(1),
      previewFile: z.string(),
      previewSha256: hash,
    })
    .passthrough()
    .parse(input);
  if (
    asset.source !== "OpenGameArt" ||
    proof.id !== asset.id ||
    proof.sourceUrl !== asset.sourceUrl ||
    proof.title !== asset.title ||
    proof.license !== asset.license ||
    proof.licenseUrl !== asset.licenseUrl ||
    proof.attribution !== asset.attribution ||
    JSON.stringify(proof.authors) !==
      JSON.stringify(asset.authors ?? [asset.author]) ||
    JSON.stringify([...proof.formats].sort()) !==
      JSON.stringify([...asset.formats].sort()) ||
    !proof.downloadUrls.includes(proof.downloadUrl) ||
    !isOpenGameArtDownloadUrl(proof.downloadUrl) ||
    proof.downloadUrl !== asset.previewProvenance.url ||
    proof.previewFile !== asset.previewProvenance.file ||
    proof.previewSha256 !== asset.previewProvenance.sha256
  )
    throw new Error(`OpenGameArt evidence mismatch: ${asset.id}`);
  return proof;
}
