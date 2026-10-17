"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useOfferClock } from "@/lib/use-offer-clock";
import { offerStatus } from "@/lib/offer-utils";
import type { Promotion } from "@/lib/types";

export type TickerAsset = { id: string; title: string; author: string; license: string };
export type TickerOffer = Pick<Promotion, "id" | "title" | "type" | "discountPercent" | "source" | "expiresAt" | "lastChecked">;
export type TickerWorld = { name: string; count: number };

type Tick = { key: string; href: string; tag: string; tone: "new" | "deal" | "limited"; title: string; meta: string };

const SECONDS_PER_ITEM = 4.5;
const number = new Intl.NumberFormat("en-US");

function interleave(free: Tick[], promoted: Tick[]) {
  const every = promoted.length ? Math.max(2, Math.floor(free.length / promoted.length)) : Infinity;
  return free.flatMap((tick, index) => {
    const offer = (index + 1) % every === 0 ? promoted[(index + 1) / every - 1] : undefined;
    return offer ? [tick, offer] : [tick];
  });
}

function Track({ items, duration, children }: { items: number; duration: number; children: (copy: boolean) => React.ReactNode }) {
  return <div className="ticker-viewport">
    <div className="ticker-track" style={{ "--ticker-duration": `${Math.max(items, 6) * duration}s` } as CSSProperties}>
      <ul className="ticker-list">{children(false)}</ul>
      <ul className="ticker-list ticker-copy" aria-hidden="true">{children(true)}</ul>
    </div>
  </div>;
}

export function HomeTicker({ latest, offers, worlds }: { latest: TickerAsset[]; offers: TickerOffer[]; worlds: TickerWorld[] }) {
  const now = useOfferClock(offers);
  const promoted: Tick[] = now === null ? [] : offers
    .filter((offer) => offerStatus(offer, now) === "active")
    .map((offer) => ({
      key: offer.id,
      href: `/asset/${offer.id}/`,
      tag: offer.type === "limited_free" ? "FREE NOW" : `−${offer.discountPercent}%`,
      tone: offer.type === "limited_free" ? "limited" : "deal",
      title: offer.title,
      meta: offer.source,
    }));
  const ticks = interleave(latest.map((asset) => ({
    key: asset.id,
    href: `/asset/${asset.id}/`,
    tag: "NEW",
    tone: "new",
    title: asset.title,
    meta: `${asset.author} · ${asset.license}`,
  })), promoted);

  return <section className="home-ticker motion-surface" data-motion="paused" aria-label="Live catalog feed">
    <div className="ticker-row">
      <span className="ticker-label"><span className="live-dot" /> LIVE</span>
      <Track items={ticks.length} duration={SECONDS_PER_ITEM}>{(copy) => ticks.map((tick) => <li key={tick.key}>
        <Link href={tick.href} className="ticker-item" tabIndex={copy ? -1 : undefined}>
          <span className={`ticker-tag tone-${tick.tone}`}>{tick.tag}</span>
          <strong>{tick.title}</strong>
          <span className="ticker-meta">{tick.meta}</span>
        </Link>
      </li>)}</Track>
    </div>
    <div className="ticker-row ticker-row-worlds">
      <span className="ticker-label">WORLDS</span>
      <Track items={worlds.length} duration={SECONDS_PER_ITEM * 1.6}>{(copy) => worlds.map((world) => <li key={world.name}>
        <Link href={`/category/${world.name.toLowerCase()}/`} className="ticker-world" tabIndex={copy ? -1 : undefined}>
          {world.name}<span>{number.format(world.count)}</span>
        </Link>
      </li>)}</Track>
    </div>
  </section>;
}
