import { readFile, writeFile } from "node:fs/promises";
import { enrichFreeAsset } from "../lib/free-metadata";
import { validateCatalog, validateEvidenceDate } from "../lib/catalog-schema";
import type { Asset } from "../lib/types";

async function main() {
  const input = JSON.parse(
    await readFile("data/assets.json", "utf8"),
  ) as Asset[];
  const assets: Asset[] = [];
  for (const item of input) {
    const proof = JSON.parse(
      await readFile(`data/evidence/${item.id}.json`, "utf8"),
    );
    validateEvidenceDate(item.verifiedAt, proof);
    assets.push(
      enrichFreeAsset(item, proof.lastLinkCheckAt ?? proof.checkedAt),
    );
  }
  validateCatalog(assets);
  await writeFile("data/assets.json", JSON.stringify(assets, null, 2) + "\n");
  console.log(
    `Enriched ${assets.length} free records using their recorded checks; no timestamps fabricated.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
