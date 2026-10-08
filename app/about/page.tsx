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
      <section className="document-section" id="radar-score">
        <h2>A useful signal: Radar Score.</h2>
        <p>
          Radar Score is our editorial score from 0–100. It helps compare a
          find’s usefulness and value; marketplace stars and rating counts are
          shown separately. These are assessments of the published information,
          rather than hands-on performance tests.
        </p>
        <table className="score-method-table">
          <thead>
            <tr>
              <th scope="col">What we consider</th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Quality and marketplace ratings</td>
              <td>25</td>
            </tr>
            <tr>
              <td>Value for the asking price</td>
              <td>20</td>
            </tr>
            <tr>
              <td>Verified discount</td>
              <td>15</td>
            </tr>
            <tr>
              <td>Completeness and documented contents</td>
              <td>10</td>
            </tr>
            <tr>
              <td>Commercial license usability</td>
              <td>20</td>
            </tr>
            <tr>
              <td>Creator and source reputation</td>
              <td>10</td>
            </tr>
          </tbody>
        </table>
        <p>
          Quality blends published stars with the editorial grade, using a
          ten-rating prior so a small sample does not dominate. Value,
          completeness and reputation are editorial grades from 0–5, supported
          by a selection rationale on each promotion page. Discount points come
          from the verified prices. We round each factor to whole points.
        </p>
        <p>
          Permanently free packs receive full value and free-price points,
          neutral quality points when unrated, format and file-count points, and
          verified commercial-license points. External ratings stay unknown when
          a source has not published them. Paid deals need at least 30% off, a
          score of 70, quality and value grades of at least 3/5, a commercial
          license, and at least 4 stars when a marketplace rating exists.
        </p>
      </section>
      <section className="document-section">
        <h2>A small window. A clear price.</h2>
        <p>
          Free Today highlights premium assets temporarily free to claim. Deals
          Radar is a curated selection of paid discounts. Promotions display
          their verified currency and license tier; source pages provide the
          current purchase and claim options.
        </p>
        <p>
          Expired promotions leave discovery automatically. Promotions also stop
          appearing after 48 hours without a new price and license check. A
          countdown appears only when the source provides a known deadline. When
          artwork permission is unclear, an original editorial cover links to
          the publisher’s previews.
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
