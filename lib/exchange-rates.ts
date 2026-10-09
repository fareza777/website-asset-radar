export const ECB_FEED_URL =
  "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
export const ECB_RATES_URL =
  "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html";
export const FX_MAX_AGE_MS = 7 * 86400000; // Covers weekends and bank holidays.
export type ExchangeRates = {
  provider: "European Central Bank";
  sourceUrl: string;
  base: "EUR";
  date: string;
  checkedAt: string;
  feedSha256: string;
  rates: Record<string, number>;
};

export function validateExchangeRates(
  input: unknown,
  now = Date.now(),
): ExchangeRates {
  const data = input as ExchangeRates | null;
  if (
    !data ||
    !Number.isFinite(now) ||
    data.provider !== "European Central Bank" ||
    data.sourceUrl !== ECB_FEED_URL ||
    data.base !== "EUR"
  )
    throw new Error("Exchange rates need the official ECB feed and EUR base");
  const date = Date.parse(`${data.date}T00:00:00Z`);
  const checked = Date.parse(data.checkedAt);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
    !Number.isFinite(date) ||
    new Date(date).toISOString().slice(0, 10) !== data.date ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(
      data.checkedAt,
    ) ||
    !Number.isFinite(checked) ||
    new Date(checked).toISOString().slice(0, 19) !==
      data.checkedAt.slice(0, 19) ||
    date > checked ||
    checked > now ||
    !/^[a-f0-9]{64}$/.test(data.feedSha256) ||
    !data.rates ||
    typeof data.rates !== "object" ||
    Array.isArray(data.rates) ||
    data.rates.EUR !== 1 ||
    !data.rates.USD ||
    !data.rates.IDR ||
    Object.entries(data.rates).some(
      ([currency, rate]) =>
        !/^[A-Z]{3}$/.test(currency) ||
        !Intl.supportedValuesOf("currency").includes(currency) ||
        typeof rate !== "number" ||
        !Number.isFinite(rate) ||
        rate <= 0,
    )
  )
    throw new Error("Invalid, missing or future exchange-rate evidence");
  return data;
}

export function convertToUsd(
  price: number,
  currency: string,
  rates: ExchangeRates,
  now: number,
): number | null {
  if (!Number.isFinite(price) || price < 0) return null;
  if (currency === "USD") return price;
  try {
    validateExchangeRates(rates, now);
    if (now >= Date.parse(`${rates.date}T00:00:00Z`) + FX_MAX_AGE_MS)
      return null;
    const sourceRate = rates.rates[currency];
    if (!sourceRate) return null;
    const usd = price * (rates.rates.USD / sourceRate);
    return Number.isFinite(usd) && (price === 0 || usd > 0) ? usd : null;
  } catch {
    return null;
  }
}
