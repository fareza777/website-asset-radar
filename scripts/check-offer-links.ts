import { mkdir, readFile, writeFile } from "node:fs/promises";
import { validateOffers } from "../lib/offers";
import { fetchPermittedOffer } from "./offer-source-policy";

async function main() {
  const argument = process.argv.find((a) => a.startsWith("--limit="));
  const limit = argument ? Number(argument.split("=")[1]) : 5;
  if (!Number.isInteger(limit) || limit < 1 || limit > 10)
    throw new Error("Use --limit=1 through --limit=10");
  const offers = validateOffers(
    JSON.parse(await readFile("data/offers.json", "utf8")),
  )
    .sort((a, b) => a.lastChecked.localeCompare(b.lastChecked))
    .slice(0, limit);
  const results: {
    id: string;
    url: string;
    ok: boolean;
    status?: number;
    error?: string;
  }[] = [];
  const checked = new Map<
    string,
    { ok: boolean; status?: number; error?: string }
  >();
  for (const offer of offers) {
    for (const url of new Set([offer.canonicalSourceUrl, offer.licenseUrl])) {
      let result = checked.get(url);
      if (!result) {
        try {
          const response = await fetchPermittedOffer(url, { method: "HEAD" });
          result = { ok: true, status: response.status };
        } catch (error) {
          result = {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
        checked.set(url, result);
      }
      results.push({ id: offer.id, url, ...result });
    }
  }
  await mkdir(".cache", { recursive: true });
  await writeFile(
    ".cache/offer-link-report.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        note: "Reachability only. This report does not verify prices, license terms, expiry or update lastChecked.",
        results,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${results.filter((a) => a.ok).length}/${results.length} source/license links reachable; report: .cache/offer-link-report.json. No offer verification timestamps changed.`,
  );
  if (results.some((a) => !a.ok)) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
