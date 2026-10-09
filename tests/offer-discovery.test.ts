import test from "node:test";
import assert from "node:assert/strict";
import { readItchPromotion } from "../scripts/offer-discovery-utils";
// Synthetic fixtures are never publication evidence.
const product = {
  "@type": "Product",
  name: "Test asset pack",
  offers: {
    price: "4.80",
    priceCurrency: "USD",
    priceValidUntil: "2026-10-11T20:00:00Z",
  },
  aggregateRating: { ratingValue: "5.0", ratingCount: 18 },
};
function page(panel: string, data = product) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script><div class="buy_row">${panel}</div>`;
}
test("a sale needs matching live purchase prices and structured data", () => {
  const panel =
    '<span class="dollars original_price">$12.00</span><span class="dollars" itemprop="price">$4.80 USD</span> or more';
  const offer = readItchPromotion(page(panel));
  assert.equal(offer?.originalPrice, 12);
  assert.equal(offer?.salePrice, 4.8);
  assert.equal(offer?.discountPercent, 60);
  assert.equal(offer?.expiresAt, "2026-10-11T20:00:00.000Z");
  assert.equal(readItchPromotion(page(panel.replace("$4.80", "$7.00"))), null);
});
test("a campaign deadline or name-your-price label cannot create an invented discount", () => {
  assert.equal(
    readItchPromotion(page('<span class="dollars">$4.80</span> USD or more')),
    null,
  );
  assert.equal(
    readItchPromotion(page("Download NowName your own price")),
    null,
  );
});
test("unknown expiry stays null and observed EUR is never relabeled USD", () => {
  const data = {
    ...product,
    offers: {
      price: "9.97",
      priceCurrency: "EUR",
      priceValidUntil: "next week",
    },
  };
  const offer = readItchPromotion(
    page(
      '<span class="dollars original_price">19.95€</span><span class="dollars">9.97€</span> EUR or more',
      data,
    ),
  );
  assert.equal(offer?.currency, "EUR");
  assert.equal(offer?.salePrice, 9.97);
  assert.equal(offer?.expiresAt, null);
});
