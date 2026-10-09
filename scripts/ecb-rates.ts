import { createHash } from "node:crypto";
import { load } from "cheerio";
import { ECB_FEED_URL, validateExchangeRates } from "../lib/exchange-rates";

export function parseEcbRates(xml: string, checkedAt: string) {
  const $ = load(xml, { xmlMode: true });
  const dates = $("Cube[time]");
  if (dates.length !== 1)
    throw new Error("ECB daily feed needs exactly one dated observation");
  const rates: Record<string, number> = { EUR: 1 };
  dates.children("Cube[currency][rate]").each((_, element) => {
    const currency = $(element).attr("currency")!;
    if (currency in rates)
      throw new Error(`Duplicate ECB currency: ${currency}`);
    rates[currency] = Number($(element).attr("rate"));
  });
  return validateExchangeRates(
    {
      provider: "European Central Bank",
      sourceUrl: ECB_FEED_URL,
      base: "EUR",
      date: dates.attr("time"),
      checkedAt,
      feedSha256: createHash("sha256").update(xml).digest("hex"),
      rates,
    },
    Date.parse(checkedAt),
  );
}
