"use client";

import Link from "next/link";
import { Target as RadarIcon } from "@/lib/icons";
import { siteName } from "@/lib/site";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <span className="footer-brand">
          <RadarIcon size={17} /> {siteName}
        </span>
        <span className="footer-tagline">
          Find your pieces. Build your world.
        </span>
      </div>
      <nav aria-label="Footer">
        <Link href="/about/">About</Link>
        <Link href="/licenses/">Licenses & sources</Link>
      </nav>
      <p>
        Assets belong to their creators. A free library for independent makers.
      </p>
    </footer>
  );
}
