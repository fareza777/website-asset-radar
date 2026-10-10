import { readFile, readdir, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const assets = JSON.parse(await readFile("data/assets.json", "utf8"));
const offers = JSON.parse(await readFile("data/offers.json", "utf8"));
const archive = JSON.parse(await readFile("data/offer-archive.json", "utf8"));
const ids = JSON.stringify(
  [...assets, ...offers, ...archive.map((item) => item.offer)].map(
    (asset) => asset.id,
  ),
);
const escapedIds = JSON.stringify(ids).slice(1, -1);
const report = {
  files: 0,
  bytes: 0,
  assetPages: 0,
  assetPageBytes: 0,
  previewBytes: 0,
  sharedCatalogBytes: 0,
  sharedIconBytes: 0,
};

async function walk(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) {
      await walk(file);
      continue;
    }
    const relative = path.relative(root, file).split(path.sep).join("/");
    const size = (await stat(file)).size;
    report.files++;
    report.bytes += size;
    if (relative.startsWith("asset/")) {
      report.assetPageBytes += size;
      if (relative.endsWith("/index.html")) report.assetPages++;
    }
    if (relative.startsWith("previews/")) report.previewBytes += size;
    if (relative.startsWith("_catalog/")) report.sharedCatalogBytes += size;
    if (relative.startsWith("_ui/")) report.sharedIconBytes += size;
    if (relative.startsWith("assets/") || relative.startsWith("categories/")) {
      throw new Error(
        `Duplicate legacy route exported: ${relative}. Keep the Vercel redirect instead.`,
      );
    }
    if (/\.(html|txt)$/.test(relative) && ids.length > 1000) {
      const text = await readFile(file, "utf8");
      if (text.includes(ids) || text.includes(escapedIds)) {
        throw new Error(
          `Whole catalog ID list embedded in ${relative}; keep it in the shared client module.`,
        );
      }
    }
  }
}
await walk(root);
// Keep growth linear and fail before accidental per-page catalog serialization
// becomes another production deployment. This is a regression guard, not an
// asset-import quota or a promise about Vercel's billing/storage meter.
if (report.assetPages && report.assetPageBytes / report.assetPages > 180000) {
  throw new Error(
    `Asset export exceeds 180 KB per page on average: ${Math.round(report.assetPageBytes / report.assetPages)} bytes.`,
  );
}
await mkdir(".cache", { recursive: true });
await writeFile(
  ".cache/export-size.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `Export size verified: ${(report.bytes / 1000000).toFixed(2)} MB, ${report.files} files; ${(report.assetPageBytes / report.assetPages / 1000).toFixed(1)} KB per asset across HTML/navigation files, ${(report.previewBytes / 1000000).toFixed(2)} MB previews.`,
);
