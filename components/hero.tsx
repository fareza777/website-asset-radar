import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight as ArrowUpRightIcon,
  ArrowRight as ArrowRightIcon,
  ShieldCheck as ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <div className="hero-eyebrow">
          <span className="live-dot" /> THE CREATIVE HEAD START
        </div>
        <h1 id="hero-heading">
          Your next world
          <br />
          <span>starts here.</span>
        </h1>
        <p>
          Remarkable free game assets. Verified licenses.
          <br className="desktop-br" /> More time to make something great.
        </p>
        <Link href="/free/" className="button primary">
          Explore the library <ArrowRightIcon size={18} />
        </Link>
      </div>
      <Link
        href="/asset/kenney-nature-kit/"
        className="hero-feature"
        aria-label="Discover Kenney Nature Kit"
      >
        <div className="hero-art">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <Image
            src="/previews/hero-nature.webp"
            width={1200}
            height={698}
            alt="A colorful low-poly island created from Kenney's free Nature Kit"
            className="hero-image"
            priority
            fetchPriority="high"
            sizes="(max-width: 750px) 90vw, 45vw"
          />
        </div>
        <div className="hero-feature-caption">
          <div>
            <span className="featured-label">ON OUR RADAR</span>
            <strong>
              Nature Kit <span>by Kenney</span>
            </strong>
          </div>
          <span className="hero-cc0">
            <ShieldCheckIcon size={15} /> CC0
          </span>
          <span className="hero-feature-arrow">
            <ArrowUpRightIcon size={20} />
          </span>
        </div>
      </Link>
    </section>
  );
}
