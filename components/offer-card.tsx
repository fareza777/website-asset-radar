"use client";
import Link from "next/link";
import { ArrowUpRight, Star, Clock } from "@/lib/icons";
import type { CardPromotion } from "@/lib/catalog-card";
import { formatCountdown, offerStatus } from "@/lib/offer-utils";
import { usdPrice, usdRateLabel } from "@/lib/usd-prices";
import { useOfferClock } from "@/lib/use-offer-clock";
import { FavoriteButton } from "./favorite-button";
import { RadarBadge } from "./radar-badge";
import { OfferPreview } from "./offer-preview";
import { EngineChips } from "./engine-compatibility";
import { PublisherCredit } from "./publisher-credit";
import { DealBadge } from "./radar-badge";

export function OfferCard({
  asset,
  view = "grid",
  preferredEngine,
}: {
  asset: CardPromotion;
  view?: "grid" | "list";
  preferredEngine?: string;
}) {
  const now = useOfferClock([asset]);
  const status = now === null ? null : offerStatus(asset, now);
  const active = status === "active";
  const original =
    now === null ? null : usdPrice(asset.originalPrice, asset.currency, now);
  const sale =
    now === null ? null : usdPrice(asset.salePrice, asset.currency, now);
  return (
    <article
      className={`asset-card offer-card ${view === "list" ? "list-card" : ""}`}
    >
      <div className="asset-image-wrap">
        <Link href={`/asset/${asset.id}/`} tabIndex={-1} aria-hidden="true">
          <OfferPreview asset={asset} />
        </Link>
        <FavoriteButton asset={{ id: asset.id, title: asset.title }} />
      </div>
      <div className="asset-card-body">
        <div className="offer-kind-row">
          <span
            className={`offer-kind ${asset.type === "limited_free" ? "limited" : ""}`}
          >
            {active
              ? asset.type === "limited_free"
                ? "LIMITED FREE"
                : `−${asset.discountPercent}%`
              : status === null
                ? "PRICE CHECK"
                : "OFFER ARCHIVED"}
          </span>
          <RadarBadge
            score={asset.radarScore}
            provisional={asset.rating === null}
          />
        </div>
        <Link className="asset-title" href={`/asset/${asset.id}/`}>
          {asset.title}
          <ArrowUpRight className="card-arrow" size={17} />
        </Link>
        <p className="asset-author">by <PublisherCredit asset={asset} /></p>
        <div className="offer-source-row">
          <span>{asset.source}</span>
          {asset.rating !== null && (
            <span className="offer-rating">
              <Star size={14} weight="fill" aria-hidden="true" />
              {asset.rating.toFixed(1)}{" "}
              <span>({asset.reviewCount} ratings)</span>
            </span>
          )}
          {asset.licenseTier && <span>{asset.licenseTier} tier</span>}
        </div>
        <div className="offer-specs">
          <span>{asset.dimension}</span>
          <span>{asset.assetType}</span>
          <span title={asset.licenseNote}>{asset.license}</span>
        </div>
        <EngineChips asset={asset} preferredEngine={preferredEngine} />
        <div className="offer-price-row">
          {active && (sale || asset.type === "limited_free") ? (
            <>
              <span className="offer-price">
                {asset.type === "limited_free" ? "FREE" : sale!.text}
              </span>
              {original && (
                <s aria-label={`Original price ${original.text} USD`}>
                  {original.text}
                </s>
              )}
              <span className="offer-currency">USD</span>
            </>
          ) : (
            <span className="offer-inactive">
              {status === null
                ? "Loading verified price…"
                : active
                  ? "Check USD price at source"
                  : status === "expired"
                    ? "Promotion ended"
                    : "Awaiting a fresh price check"}
            </span>
          )}
        </div>
        <DealBadge score={asset.dealScore} />
        {active && original?.estimated && (
          <p
            className="offer-fx-note"
            title={`Converted for comparison using European Central Bank reference rates from ${usdRateLabel(original.rateDate!)}. Source pricing may differ.`}
          >
            USD estimate · ECB {usdRateLabel(original.rateDate!)}
          </p>
        )}
        <div className="offer-footer">
          <span className="offer-expiry">
            {active && asset.expiresAt ? (
              <>
                <Clock size={14} />
                <time
                  dateTime={asset.expiresAt}
                  title={`Ends ${new Date(asset.expiresAt).toUTCString()}`}
                >
                  {formatCountdown(asset.expiresAt, now!)}
                </time>
              </>
            ) : active ? (
              "End time unconfirmed"
            ) : (
              "Check the source for availability"
            )}
          </span>
          {active ? (
            <a
              className="offer-action"
              href={asset.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                if (offerStatus(asset, Date.now()) !== "active")
                  event.preventDefault();
              }}
            >
              {asset.type === "limited_free" ? "Claim Free" : "View Deal"}
              <ArrowUpRight size={16} />
            </a>
          ) : (
            <Link className="offer-action" href={`/asset/${asset.id}/`}>
              Details
              <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
