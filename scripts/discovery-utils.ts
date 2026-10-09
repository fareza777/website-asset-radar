import { load } from "cheerio";
import policy from "../data/automation-policy.json";

export function discoveryLimit(args: string[]): number {
  const modes = args.filter((arg) => arg.startsWith("--mode="));
  const mode = modes[0]?.slice(7) ?? "daily";
  if (modes.length > 1 || !["daily", "backfill"].includes(mode))
    throw new Error("Use --mode=daily or --mode=backfill");
  const batchSize =
    mode === "backfill"
      ? policy.backfill.discoveryBatchSize
      : policy.discoveryBatchSize;
  const flags = args.filter((arg) => arg.startsWith("--limit="));
  const limit = flags.length ? Number(flags[0].slice(8)) : batchSize;
  if (flags.length > 1 || !Number.isSafeInteger(limit) || limit < 1)
    throw new Error(
      "Use --limit=<positive safe integer>; this is a discovery batch, not an addition quota",
    );
  return limit;
}

/** Follow only product and pagination links actually present in the public index. */
export function readKenneyIndex(html: string, page: string) {
  const $ = load(html);
  const products = new Set<string>(),
    pages = new Set<string>();
  $("a[href]").each((_, element) => {
    let url: URL;
    try {
      url = new URL($(element).attr("href")!, page);
    } catch {
      return;
    }
    if (url.origin !== "https://kenney.nl" || url.search || url.hash) return;
    url.hash = "";
    if (/^\/assets\/[a-z0-9-]+$/.test(url.pathname))
      products.add(url.toString());
    if (/^\/assets\/page:[1-9][0-9]*$/.test(url.pathname))
      pages.add(url.toString());
  });
  return { products: [...products], pages: [...pages] };
}
