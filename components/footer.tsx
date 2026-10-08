import Link from "next/link";
import {
  ArrowUpRight as ArrowUpRightIcon,
  Target as RadarIcon,
} from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <span className="footer-brand">
          <RadarIcon size={17} /> AssetRadar
        </span>
        <span className="footer-tagline">
          Find your pieces. Build your world.
        </span>
      </div>
      <nav aria-label="Footer">
        <Link href="/about/">About</Link>
        <Link href="/licenses/">Licenses & sources</Link>
        <a
          href="https://github.com/fareza777/website-asset-radar"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <ArrowUpRightIcon size={12} />
        </a>
      </nav>
      <p>
        Assets belong to their creators. A free library for independent makers.
      </p>
    </footer>
  );
}
