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
      !/^(data\/assets\.json|data\/evidence\/[a-z0-9-]+\.json|public\/previews\/[a-z0-9-]+\.webp|public\/audio\/[a-z0-9-]+\.ogg)$/.test(
        file,
      ),
  )
)
  throw new Error(
    "Unexpected changes outside the catalog, evidence, and licensed previews",
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
if (existing.length) {
  console.log(existing[0].url);
  process.exit(0);
}
mkdirSync(".cache", { recursive: true });
const catalog = JSON.parse(readFileSync("data/assets.json", "utf8"));
const changedIds = changed
  .filter((file) => file.startsWith("data/evidence/"))
  .map((file) =>
    file
      .split("/")
      .at(-1)
      .replace(/\.json$/, ""),
  );
const reviewed = catalog.filter((asset) => changedIds.includes(asset.id));
writeFileSync(
  ".cache/catalog-pr-body.md",
  `Updates the free-asset catalog with verified source links, license evidence, and preview provenance.\n\nAssets reviewed:\n\n${reviewed.map((asset) => `- [${asset.title}](${asset.sourceUrl}) — ${asset.license}; checked ${asset.verifiedAt}; evidence: \`data/evidence/${asset.id}.json\``).join("\n") || "See the catalog diff."}\n\nChanged files:\n\n${changed.map((file) => `- \`${file}\``).join("\n")}\n\nValidation: lint, TypeScript, integrity tests, media/evidence validation, and static production build passed. Review the candidate and link-check report summaries from the Cursor run alongside each record's evidence.\n\nThis PR requires human review. It does not merge itself or deploy directly.\n`,
);
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
    `Catalog: verified free assets (${date})`,
    "--body-file",
    ".cache/catalog-pr-body.md",
  ]),
);
