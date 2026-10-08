import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "A creative head start for game makers",
  description:
    "AssetRadar is a free, independent library of verified game development assets. No accounts, no subscriptions, just a better starting point for your next game.",
  alternates: { canonical: "/about/" },
};
export default function About() {
  return (
    <div className="document-page">
      <div className="page-intro">
        <span className="page-intro-icon">
          <Sparkle size={29} weight="duotone" />
        </span>
        <h1>
          More making.
          <br />
          <span className="accent-text">Less searching.</span>
        </h1>
        <p>A thoughtful little library for people building their next world.</p>
      </div>
      <section className="document-section">
        <h2>Every game starts somewhere.</h2>
        <p>
          Sometimes it starts with a sketch. Sometimes a game jam. Sometimes one
          lovely set of tiles that gets your imagination moving. AssetRadar
          makes those starting points easier to find.
        </p>
        <p>
          We bring together genuinely free game assets from their original
          sources, with clear license evidence and previews of the assets
          themselves. The people who create them deserve the credit, the visit,
          and your support.
        </p>
      </section>
      <section className="document-section">
        <h2>Your library, your browser.</h2>
        <p>
          Search, browse, and collect without an account. Favorites and personal
          collections stay in your browser&apos;s local storage. They are
          specific to this device and browser and can be lost if you clear your
          browser data.
        </p>
        <p>
          The public library is served as static pages. There are no advertising
          trackers, paid memberships, or hidden download gates.
        </p>
      </section>
      <section className="document-section">
        <h2>A library that can keep growing.</h2>
        <p>
          Catalog changes are checked against permitted sources, deduplicated,
          and proposed for human review. You can inspect the catalog,
          verification evidence, and maintenance process in the open-source
          repository.
        </p>
        <a
          href="https://github.com/fareza777/website-asset-radar"
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Explore the project on GitHub <ArrowUpRight size={16} />
        </a>
      </section>
      <Link href="/" className="button primary">
        Find your next idea <ArrowRight size={18} />
      </Link>
    </div>
  );
}
