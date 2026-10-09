"use client";
import Link from "next/link";
import { ArrowRight, Fire, Tag } from "@phosphor-icons/react";
import type { Promotion } from "@/lib/types";
import { offerStatus } from "@/lib/offer-utils";
import { useOfferClock } from "@/lib/use-offer-clock";
import { OfferCard } from "./offer-card";

export function PromotionSection({
  offers,
  type,
}: {
  offers: Promotion[];
  type: Promotion["type"];
}) {
  const now = useOfferClock(offers);
  // Stable card geometry is rendered in HTML; live prices/claims wait for the
  // browser clock so an old static page cannot advertise an expired price.
  const verified = offers
    .filter(
      (asset) =>
        asset.type === type &&
        (now === null || offerStatus(asset, now) === "active"),
    )
    .sort((a, b) => type === "deal" ? b.discountPercent - a.discountPercent || b.dealScore - a.dealScore : b.radarScore - a.radarScore);
  const visible = verified.slice(0, 3);
  const isFree = type === "limited_free",
    Icon = isFree ? Fire : Tag;
  return (
    <section className="discovery-section" aria-labelledby={`${type}-heading`}>
      <div className="discovery-heading">
        <div>
          <h2 id={`${type}-heading`}>
            <Icon size={23} weight="duotone" />
            {isFree ? "Free Today" : "Biggest Deals"}
            {isFree && <span className="section-percent">100% OFF</span>}
            {now !== null && (
              <span className="asset-count">{verified.length}</span>
            )}
          </h2>
          <p>
            {isFree
              ? "Premium finds. Yours to claim while they’re free."
              : "Meaningful discounts, selected for quality and value."}
          </p>
        </div>
        <Link className="text-link" href={isFree ? "/free-today/" : "/deals/"}>
          View all
          <ArrowRight size={17} />
        </Link>
      </div>
      {visible.length ? (
        <div
          className={`asset-grid discovery-grid ${visible.length === 2 ? "two-offers" : ""}`}
        >
          {visible.map((asset) => (
            <OfferCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="promotion-empty">
          <Icon size={25} />
          <div>
            <strong>
              {isFree
                ? "No verified free promotions right now."
                : "Nothing worthwhile on the radar right now."}
            </strong>
            <p>
              {isFree
                ? "The permanent free library is always a good place to start."
                : "New deals appear once their price and license are checked."}
            </p>
          </div>
          <Link href="/free/" className="text-link">
            Explore free assets
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
