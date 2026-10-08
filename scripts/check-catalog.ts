import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { validateCatalog } from "../lib/catalog-schema";
import { fetchPermitted } from "./source-policy";
import { readKenneyEvidence, readPolyHavenLicense } from "./verification";

async function main() {
  const assets = validateCatalog(
    JSON.parse(await readFile("data/assets.json", "utf8")),
  );
  const write = process.argv.includes("--write");
  const limitFlag = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitFlag ? Number(limitFlag.split("=")[1]) : assets.length;
  if (!Number.isInteger(limit) || limit < 1)
    throw new Error("--limit must be a positive integer");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  const selected = [...assets]
    .filter((asset) => !write || asset.verifiedAt < today)
    .sort(
      (a, b) =>
        a.verifiedAt.localeCompare(b.verifiedAt) || a.id.localeCompare(b.id),
    )
    .slice(0, limit);
  const checkedAt = new Date().toISOString();
  const results: {
    id: string;
    ok: boolean;
    reason?: string;
    sha256?: string;
  }[] = [];
  const evidenceWrites: { file: string; content: string }[] = [];
  let polyLicense: boolean | undefined;
  let polyLicenseHash: string | undefined;
  for (const asset of selected) {
    try {
      const stored = JSON.parse(
        await readFile(`data/evidence/${asset.id}.json`, "utf8"),
      );
      let text: string;
      if (asset.source === "Kenney") {
        text = await (await fetchPermitted(asset.sourceUrl)).text();
        const current = readKenneyEvidence(text);
        if (current.title !== asset.title)
          throw new Error("Publisher title changed; manual review needed");
        if (current.archiveUrl !== stored.archiveUrl)
          throw new Error(
            "Archive changed; inspect the new included license and preview before re-verifying",
          );
        if (!/Creative Commons Zero|CC0/i.test(stored.licenseText || ""))
          throw new Error("Stored archive license is absent");
        await fetchPermitted(current.archiveUrl, { method: "HEAD" });
        stored.archiveLinkCheckedAt = checkedAt;
        stored.pageSha256 = createHash("sha256").update(text).digest("hex");
      } else {
        await fetchPermitted(asset.sourceUrl, { method: "HEAD" });
        if (polyLicense === undefined) {
          const licenseHtml = await (
            await fetchPermitted("https://polyhaven.com/license")
          ).text();
          polyLicense = readPolyHavenLicense(licenseHtml);
          polyLicenseHash = createHash("sha256")
            .update(licenseHtml)
            .digest("hex");
        }
        if (!polyLicense)
          throw new Error(
            "Poly Haven's asset license changed or cannot be verified",
          );
        text = await (await fetchPermitted(asset.verificationUrl)).text();
        const info = JSON.parse(text);
        if (info.name !== asset.title || info.type !== 1)
          throw new Error("Asset identity changed; manual review needed");
        await fetchPermitted(stored.assetFile, { method: "HEAD" });
        stored.apiSha256 = createHash("sha256").update(text).digest("hex");
        stored.apiMetadata = info;
        stored.licensePageSha256 = polyLicenseHash;
        stored.assetFileLinkCheckedAt = checkedAt;
      }
      const hash = createHash("sha256").update(text).digest("hex");
      if (asset.license !== "CC0")
        throw new Error("This checker only recertifies explicit CC0 evidence");
      results.push({ id: asset.id, ok: true, sha256: hash });
      if (write) {
        asset.verifiedAt = today;
        asset.evidenceSha256 = hash;
        stored.lastLinkCheckAt = checkedAt;
        evidenceWrites.push({
          file: `data/evidence/${asset.id}.json`,
          content: JSON.stringify(stored, null, 2) + "\n",
        });
      }
      console.log(`OK ${asset.id}`);
    } catch (error) {
      const reason = (error as Error).message;
      results.push({ id: asset.id, ok: false, reason });
      console.error(`REVIEW ${asset.id}: ${reason}`);
    }
  }
  await mkdir(".cache", { recursive: true });
  await writeFile(
    ".cache/link-check-report.json",
    JSON.stringify({ checkedAt, results }, null, 2) + "\n",
  );
  const failures = results.filter((r) => !r.ok);
  if (failures.length)
    throw new Error(
      `${failures.length} check(s) need review. Catalog and evidence files were not changed.`,
    );
  if (write && selected.length) {
    validateCatalog(assets);
    for (const item of evidenceWrites) await writeFile(item.file, item.content);
    await writeFile("data/assets.json", JSON.stringify(assets, null, 2) + "\n");
  }
  console.log(
    `${results.length} sources and licenses checked${write ? (selected.length ? "; verification records updated" : "; no older records to update") : "; read-only run"}.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
