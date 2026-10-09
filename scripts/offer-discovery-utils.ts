import { load } from "cheerio";
import { z } from "zod";
import { calculateDiscount } from "../lib/offer-utils";
export type ObservedPromotion = {
  title: string;
  originalPrice: number;
  salePrice: number;
  currency: string;
  discountPercent: number;
  expiresAt: string | null;
  rating: number | null;
  reviewCount: number | null;
};
const productSchema = z.object({
  "@type": z.literal("Product"),
  name: z.string().min(3),
  offers: z.object({
    price: z.union([z.number(), z.string()]),
    priceCurrency: z.string().regex(/^[A-Z]{3}$/),
    priceValidUntil: z.string().optional(),
  }),
  aggregateRating: z
    .object({
      ratingValue: z.union([z.number(), z.string()]),
      ratingCount: z.number().int().positive(),
    })
    .optional(),
});
/** Discovery only: no license, content or curation is certified by this parser. */
export function readItchPromotion(html: string): ObservedPromotion | null {
  const $ = load(html);
  const raw = $('script[type="application/ld+json"]')
    .map((_, element) => {
      try {
        const value = JSON.parse($(element).text());
        return value?.["@type"] === "Product" ? value : null;
      } catch {
        return null;
      }
    })
    .get()[0];
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return null;
  const product = parsed.data,
    salePrice = Number(product.offers.price),
    currency = product.offers.priceCurrency;
  if (
    !Number.isFinite(salePrice) ||
    salePrice < 0 ||
    (typeof product.offers.price === "string" &&
      !/^\d+(?:\.\d{1,4})?$/.test(product.offers.price))
  )
    return null;
  const row = $(".buy_row").first();
  const money = (text: string) => {
    const match = text
      .trim()
      .replace(new RegExp(`\\s+${currency}$`), "")
      .match(/^(?:[$€£]\s*)?(\d+(?:\.\d{1,2})?)(?:\s*€)?$/);
    return match ? Number(match[1]) : NaN;
  };
  const originalPrice = money(row.find(".original_price").first().text());
  const displayedSale = row
    .find(".dollars")
    .not(".original_price")
    .map((_, element) => money($(element).text()))
    .get();
  if (
    !Number.isFinite(originalPrice) ||
    originalPrice <= salePrice ||
    !displayedSale.includes(salePrice) ||
    !new RegExp(`\\b${currency}\\b`).test(row.text())
  )
    return null;
  const expiry = product.offers.priceValidUntil;
  const timestamp =
    expiry && z.iso.datetime({ offset: true }).safeParse(expiry).success
      ? Date.parse(expiry)
      : NaN;
  const rating = Number(product.aggregateRating?.ratingValue);
  return {
    title: product.name,
    originalPrice,
    salePrice,
    currency,
    discountPercent: calculateDiscount(originalPrice, salePrice),
    expiresAt: Number.isFinite(timestamp)
      ? new Date(timestamp).toISOString()
      : null,
    rating:
      Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : null,
    reviewCount: product.aggregateRating?.ratingCount ?? null,
  };
}
