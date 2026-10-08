"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star, Clock } from "@phosphor-icons/react";
import type { Promotion } from "@/lib/types";
import { formatCountdown, formatPrice, offerStatus } from "@/lib/offer-utils";
import { useOfferClock } from "@/lib/use-offer-clock";
import { FavoriteButton } from "./favorite-button";
import { RadarBadge } from "./radar-badge";
import { EditorialCover } from "./editorial-cover";
export { EditorialCover } from "./editorial-cover";

export function OfferCard({
  asset,
  view = "grid",
}: {
  asset: Promotion;
  view?: "grid" | "list";
}) {
  const now = useOfferClock([asset]);
  const status = now === null ? null : offerStatus(asset, now);
  const active = status === "active";
  return (
    <article
      className={`asset-card offer-card ${view === "list" ? "list-card" : ""}`}
    >
      <div className="asset-image-wrap">
        <Link href={`/asset/${asset.id}/`} tabIndex={-1} aria-hidden="true">
          {asset.preview ? (
            <Image
              src={asset.preview}
              alt={`${asset.title} authorized thumbnail`}
              width={800}
              height={450}
              className="asset-image"
              sizes="(max-width: 600px) 100vw, 33vw"
            />
          ) : (
            <EditorialCover asset={asset} />
          )}
        </Link>
        <FavoriteButton asset={asset} />
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
          <RadarBadge score={asset.radarScore} />
        </div>
        <Link className="asset-title" href={`/asset/${asset.id}/`}>
          {asset.title}
          <ArrowUpRight className="card-arrow" size={17} />
        </Link>
        <p className="asset-author">by {asset.author}</p>
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
          <span>
            {asset.engines.length ? asset.engines.join(" / ") : asset.dimension}
          </span>
          <span>{asset.assetType}</span>
          <span title={asset.licenseNote}>{asset.license}</span>
        </div>
        <div className="offer-price-row">
          {active ? (
            <>
              <span className="offer-price">
                {asset.type === "limited_free"
                  ? "FREE"
                  : formatPrice(asset.salePrice, asset.currency)}
              </span>
              <s
                aria-label={`Original price ${formatPrice(asset.originalPrice, asset.currency)}`}
              >
                {formatPrice(asset.originalPrice, asset.currency)}
              </s>
            </>
          ) : (
            <span className="offer-inactive">
              {status === null
                ? "Loading verified price…"
                : status === "expired"
                  ? "Promotion ended"
                  : "Awaiting a fresh price check"}
            </span>
          )}
        </div>
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
