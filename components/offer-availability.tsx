"use client";
import { ArrowUpRight, Clock } from "@/lib/icons";
import type { Promotion } from "@/lib/types";
import { formatCountdown, offerStatus } from "@/lib/offer-utils";
import { usdPrice, usdRateLabel } from "@/lib/usd-prices";
import { useOfferClock } from "@/lib/use-offer-clock";

export function OfferAvailability({ asset }: { asset: Promotion }) {
  const now = useOfferClock([asset]),
    status = now === null ? null : offerStatus(asset, now);
  const active = status === "active";
  const original =
    now === null ? null : usdPrice(asset.originalPrice, asset.currency, now);
  const sale =
    now === null ? null : usdPrice(asset.salePrice, asset.currency, now);
  return (
    <div className="detail-offer-availability">
      {active ? (
        <>
          <div className="detail-offer-price">
            <strong>
              {asset.type === "limited_free"
                ? "FREE"
                : (sale?.text ?? "Check source price")}
            </strong>
            {original && <s>{original.text}</s>}
            <span className="offer-kind">−{asset.discountPercent}%</span>
            <span className="offer-currency">USD</span>
          </div>
          <p>{asset.priceNote}</p>
          {asset.currency !== "USD" && (
            <p className="detail-fx-note">
              {original?.estimated ? (
                <>
                  USD estimates converted from the source currency using{" "}
                  <a
                    href={original.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ECB reference rates
                  </a>{" "}
                  from {usdRateLabel(original.rateDate!)}. These are comparison
                  amounts; checkout pricing may differ.
                </>
              ) : (
                "A current USD conversion is unavailable. Check pricing at the source."
              )}
            </p>
          )}
          {asset.expiresAt && (
            <p className="detail-offer-expiry">
              <Clock size={17} />
              <time dateTime={asset.expiresAt}>
                {formatCountdown(asset.expiresAt, now!)} ·{" "}
                {new Date(asset.expiresAt).toUTCString()}
              </time>
            </p>
          )}
        </>
      ) : (
        <div className="detail-offer-status">
          <strong>
            {status === null
              ? "Loading the latest verified offer…"
              : status === "expired"
                ? "This promotion has ended."
                : "This offer needs a fresh price check."}
          </strong>
          <p>
            {status === null
              ? "The latest verified price appears after the promotion deadline is checked."
              : "The product details are kept here for reference. Current pricing is available at the source."}
          </p>
        </div>
      )}
      <a
        className="button primary download-button"
        href={asset.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          if (active && offerStatus(asset, Date.now()) !== "active")
            event.preventDefault();
        }}
      >
        {active
          ? asset.type === "limited_free"
            ? "Claim Free"
            : "View Deal"
          : "View source"}
        <ArrowUpRight size={19} />
      </a>
    </div>
  );
}
