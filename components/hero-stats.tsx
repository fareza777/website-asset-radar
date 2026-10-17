"use client";
import { useEffect, useState } from "react";
import { useMotion } from "./motion-provider";
import { useOfferClock } from "@/lib/use-offer-clock";
import { offerStatus } from "@/lib/offer-utils";
import type { TickerOffer } from "./home-ticker";

const COUNT_MS = 1400;
const number = new Intl.NumberFormat("en-US");

/** Counts up once when motion is enabled; renders the final value otherwise. */
function CountUp({ value }: { value: number }) {
  const { state } = useMotion();
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (state !== "enabled") return;
    let frame = 0;
    const start = performance.now();
    const step = (time: number) => {
      const progress = Math.min(1, (time - start) / COUNT_MS);
      setShown(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, state]);
  return <strong>{number.format(state === "enabled" ? shown : value)}</strong>;
}

export function HeroStats({ freeCount, creatorCount, offers }: { freeCount: number; creatorCount: number; offers: TickerOffer[] }) {
  const now = useOfferClock(offers);
  const live = now === null ? null : offers.filter((offer) => offerStatus(offer, now) === "active").length;
  return <dl className="hero-stats">
    <div><dt>verified free assets</dt><dd><CountUp value={freeCount} /></dd></div>
    <div><dt>creators</dt><dd><CountUp value={creatorCount} /></dd></div>
    {live ? <div><dt>live offers</dt><dd><CountUp value={live} /></dd></div> : null}
  </dl>;
}
