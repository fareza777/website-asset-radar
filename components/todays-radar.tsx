"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Broadcast } from "@phosphor-icons/react";
import type { Asset, DirectoryAsset, Promotion } from "@/lib/types";
import { useOfferClock } from "@/lib/use-offer-clock";
import { offerStatus } from "@/lib/offer-utils";
import { usdPrice } from "@/lib/usd-prices";
import { OfferPreview } from "./offer-preview";

export function TodaysRadar({ free, offers }: { free: Asset; offers: Promotion[] }) {
  const now = useOfferClock(offers);
  const active = offers.filter((offer) => now === null || offerStatus(offer, now) === "active");
  const limited = active.filter((offer) => offer.type === "limited_free").sort((a, b) => b.radarScore - a.radarScore)[0];
  const deal = active.filter((offer) => offer.type === "deal").sort((a, b) => b.dealScore - a.dealScore)[0];
  const picks: { asset: DirectoryAsset; label: string }[] = [{ asset: free, label: "The free pick" }, ...(limited ? [{ asset: limited, label: "A limited-time find" }] : []), ...(deal ? [{ asset: deal, label: "Worth a closer look" }] : [])];
  return <section className="todays-radar" aria-labelledby="todays-radar-heading">
    <div className="todays-radar-heading"><h2 id="todays-radar-heading"><Broadcast size={22} weight="duotone" /> Today&apos;s Radar</h2><span>A small selection. A useful head start.</span></div>
    <div className="radar-picks">{picks.map(({ asset, label }) => <Link key={asset.id} className="radar-pick" href={`/asset/${asset.id}/`}>
      <div className="radar-pick-image">{asset.type === "free" ? <Image src={asset.preview} alt={`${asset.title} preview`} width={240} height={180} sizes="110px" /> : <OfferPreview asset={asset} />}</div>
      <div className="radar-pick-copy"><span>{label}</span><strong>{asset.title}</strong><div className="radar-pick-meta"><span>{asset.type === "free" ? "FREE · CC0" : now === null ? "Checking availability" : asset.type === "limited_free" ? "100% OFF" : `${asset.discountPercent}% OFF · ${usdPrice(asset.salePrice, asset.currency, now)?.text ?? "See source"}`}</span><span>Radar {asset.radarScore}</span></div></div>
      <ArrowUpRight className="radar-pick-arrow" size={18} />
    </Link>)}</div>
  </section>;
}
