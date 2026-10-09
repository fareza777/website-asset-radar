import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { runCommand as run, runNpm } from "./process-utils.mjs";

const repo = "fareza777/website-asset-radar";
const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
}).format(new Date());
if (!process.argv.includes("--publish")) {
  console.log(
    `Prepared PR helper for ${repo}. Explicit invocation: node scripts/open-catalog-pr.mjs --publish`,
  );
  process.exit(0);
}
const remote = run("git", ["remote", "get-url", "origin"]);
const expected =
  /^(https:\/\/(?:[^@/]+@)?github\.com\/fareza777\/website-asset-radar(?:\.git)?|git@github\.com:fareza777\/website-asset-radar(?:\.git)?)$/;
if (!expected.test(remote))
  throw new Error(
    "The origin remote is not the requested AssetRadar repository",
  );
const current = run("git", ["branch", "--show-current"]);
if (current !== "main" && !/^catalog\/daily-\d{4}-\d{2}-\d{2}$/.test(current))
  throw new Error("Start from main or an existing catalog maintenance branch");
const branch = current === "main" ? `catalog/daily-${date}` : current;
const prior = JSON.parse(
  run("gh", [
    "pr",
    "list",
    "--repo",
    repo,
    "--head",
    branch,
    "--state",
    "all",
    "--json",
    "url,state",
  ]),
);
if (prior.length && prior.every((pr) => pr.state !== "OPEN"))
  throw new Error(
    "This catalog branch belongs to a closed or merged PR; start a fresh branch from main",
  );
if (
  current === "main" &&
  (prior.length ||
    run("git", ["for-each-ref", "--format=%(refname)", `refs/heads/${branch}`]))
)
  throw new Error(
    "Today's maintenance branch already exists; resume its PR before applying new changes",
  );
const tracked = run("git", ["diff", "--name-only", "HEAD"])
  .split("\n")
  .filter(Boolean);
const untracked = run("git", ["ls-files", "--others", "--exclude-standard"])
  .split("\n")
  .filter(Boolean);
const workingChanges = [...new Set([...tracked, ...untracked])];
const committedChanges =
  current === "main"
    ? []
    : run("git", ["diff", "--name-only", "origin/main...HEAD"])
        .split("\n")
        .filter(Boolean);
const changed = [...new Set([...workingChanges, ...committedChanges])];
if (!changed.length) {
  console.log("No catalog changes; no PR created.");
  process.exit(0);
}
if (
  changed.some(
    (file) =>
      !/^(data\/(assets|offers|offer-archive|offer-candidates|exchange-rates)\.json|data\/(evidence|offer-evidence)\/[a-z0-9-]+\.json|public\/previews\/[a-z0-9-]+\.webp|public\/audio\/[a-z0-9-]+\.ogg)$/.test(
        file,
      ),
  )
)
  throw new Error(
    "Unexpected changes outside catalog records, evidence, and permitted media",
  );
for (const script of ["lint", "typecheck", "test", "build"])
  runNpm(["run", script]);
if (current === "main") run("git", ["switch", "-c", branch]);
if (workingChanges.length) {
  run("git", ["add", "--", ...workingChanges]);
  run("git", ["commit", "-m", `chore(catalog): verified asset update ${date}`]);
}
run("git", ["push", "-u", "origin", branch]);
const existing = JSON.parse(
  run("gh", [
    "pr",
    "list",
    "--repo",
    repo,
    "--head",
    branch,
    "--state",
    "open",
    "--json",
    "url",
  ]),
);
mkdirSync(".cache", { recursive: true });
const catalog = JSON.parse(readFileSync("data/assets.json", "utf8"));
const promotions = JSON.parse(readFileSync("data/offers.json", "utf8"));
const archive = JSON.parse(readFileSync("data/offer-archive.json", "utf8"));
const changedIds = changed
  .filter((file) => file.startsWith("data/evidence/"))
  .map((file) =>
    file
      .split("/")
      .at(-1)
      .replace(/\.json$/, ""),
  );
const reviewed = catalog.filter((asset) => changedIds.includes(asset.id));
const offerIds = changed
  .filter((file) => file.startsWith("data/offer-evidence/"))
  .map((file) =>
    file
      .split("/")
      .at(-1)
      .replace(/\.json$/, ""),
  );
const reviewedOffers = promotions.filter((asset) =>
  offerIds.includes(asset.id),
);
const archivedSummary = changed.includes("data/offer-archive.json")
  ? archive
      .slice(-10)
      .map(
        ({ offer, reason, archivedAt }) =>
          `- [${offer.title}](${offer.canonicalSourceUrl}) — ${reason}; archived ${archivedAt}; last actual verification ${offer.lastChecked}`,
      )
      .join("\n")
  : "No archive changes.";
writeFileSync(
  ".cache/catalog-pr-body.md",
  `Maintains the curated free library and verified promotions. Prices are published only with matching first-party evidence; expired or stale offers are archived.\n\nFree assets reviewed:\n\n${reviewed.map((asset) => `- [${asset.title}](${asset.sourceUrl}) — [${asset.license}](${asset.licenseUrl}); checked ${asset.lastChecked}; evidence: \`data/evidence/${asset.id}.json\``).join("\n") || "No free-asset evidence changes."}\n\nPromotions reviewed:\n\n${reviewedOffers.map((asset) => `- [${asset.title}](${asset.canonicalSourceUrl}) — ${asset.currency} ${asset.originalPrice} → ${asset.salePrice}; ${asset.discountPercent}% off; Radar Score ${asset.radarScore}; [${asset.license}](${asset.licenseUrl})${asset.licenseTier ? ` (${asset.licenseTier} tier)` : ""}; ${asset.expiresAt ? `ends ${asset.expiresAt}` : "end time unconfirmed"}; checked ${asset.lastChecked}; evidence: \`data/offer-evidence/${asset.id}.json\`${asset.publisherPreview ? `; publisher preview by ${asset.publisherPreview.credit}, source ${asset.publisherPreview.sourceUrl}, image checked ${asset.publisherPreview.checkedAt}` : "; original editorial cover"}`).join("\n") || "No promotion evidence changes."}\n\nArchive changes (most recent 10):\n\n${archivedSummary}\n\nChanged files:\n\n${changed.map((file) => `- \`${file}\``).join("\n")}\n\nValidation: lint, TypeScript, integrity tests, media/evidence validation, and static production build passed. Review discovery/link-check summaries and the daily budget counts from the Cursor run alongside each record's evidence. A successful HEAD request does not verify price or license terms. Copied local media requires explicit permission; publisher CDN previews link to observed public galleries with provenance and never refresh deal evidence. Missing/failed previews use original editorial covers.\n\nThis PR requires human review. It does not merge itself or deploy directly.\n`,
);
if (existing.length) {
  run("gh", [
    "pr",
    "edit",
    existing[0].url,
    "--repo",
    repo,
    "--title",
    `Catalog: verified assets and offers (${date})`,
    "--body-file",
    ".cache/catalog-pr-body.md",
  ]);
  console.log(existing[0].url);
  process.exit(0);
}
console.log(
  run("gh", [
    "pr",
    "create",
    "--repo",
    repo,
    "--base",
    "main",
    "--head",
    branch,
    "--draft",
    "--title",
    `Catalog: verified assets and offers (${date})`,
    "--body-file",
    ".cache/catalog-pr-body.md",
  ]),
);
