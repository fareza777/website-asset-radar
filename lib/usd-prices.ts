import snapshot from "../data/exchange-rates.json";
import {
  convertToUsd,
  ECB_RATES_URL,
  type ExchangeRates,
} from "./exchange-rates";

export function usdPrice(
  price: number,
  currency: string,
  now: number,
  rates: ExchangeRates = snapshot as ExchangeRates,
) {
  const amount = convertToUsd(price, currency, rates, now);
  if (amount === null) return null;
  const text =
    amount > 0 && amount < 0.01
      ? "< $0.01"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
          maximumFractionDigits: 2,
        }).format(amount);
  const estimated = currency !== "USD";
  return {
    text: `${estimated ? "≈ " : ""}${text}`,
    estimated,
    rateDate: estimated ? rates.date : null,
    sourceUrl: ECB_RATES_URL,
  };
}

export function usdRateLabel(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
