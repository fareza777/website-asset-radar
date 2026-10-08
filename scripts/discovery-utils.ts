import { load } from "cheerio";
import policy from "../data/automation-policy.json";

export function discoveryLimit(args: string[]): number {
  const flags = args.filter((arg) => arg.startsWith("--limit="));
  const limit = flags.length
    ? Number(flags[0].slice(8))
    : policy.maxCandidatesPerDay;
  if (
    flags.length > 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > policy.maxCandidatesPerDay
  )
    throw new Error(
      `Use --limit=1 through --limit=${policy.maxCandidatesPerDay}`,
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
    if (/^\/assets\/[a-z0-9-]+$/.test(url.pathname))
      products.add(url.toString());
    if (/^\/assets\/page:[1-9][0-9]*$/.test(url.pathname))
      pages.add(url.toString());
  });
  return { products: [...products], pages: [...pages] };
}
