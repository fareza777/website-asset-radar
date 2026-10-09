import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as pause } from "node:timers/promises";
import { ECB_FEED_URL, FX_MAX_AGE_MS } from "../lib/exchange-rates";
import { parseEcbRates } from "./ecb-rates";
import { readLimitedResponse, robotsAllows } from "./source-policy";

async function main() {
  const headers = {
    "User-Agent": "GameAssetRadar/1.0 (+https://gameassetradar.top/about/)",
  };
  const request = async (url: string) => {
    const response = await fetch(url, {
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(20000),
    });
    if (response.status !== 200)
      throw new Error(
        `ECB returned ${response.status}; existing rates preserved`,
      );
    return (await readLimitedResponse(response, 1_000_000)).text();
  };
  const robots = await request("https://www.ecb.europa.eu/robots.txt");
  if (!robotsAllows(robots, ECB_FEED_URL))
    throw new Error("ECB robots excludes the reference feed");
  await pause(5000); // ECB's published crawl delay.
  const xml = await request(ECB_FEED_URL);
  const data = parseEcbRates(xml, new Date().toISOString());
  if (Date.now() >= Date.parse(`${data.date}T00:00:00Z`) + FX_MAX_AGE_MS)
    throw new Error(
      "ECB reference feed is outdated; existing snapshot preserved",
    );
  await mkdir(".cache", { recursive: true });
  await writeFile(".cache/ecb-rates-feed.xml", xml);
  if (process.argv.includes("--write"))
    await writeFile(
      "data/exchange-rates.json",
      JSON.stringify(data, null, 2) + "\n",
    );
  console.log(
    `ECB reference rates: ${data.date}. ${process.argv.includes("--write") ? "USD display snapshot updated" : "Read-only check"}. Source prices and offer lastChecked unchanged.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
