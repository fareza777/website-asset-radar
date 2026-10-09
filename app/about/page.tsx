import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
import {
  SCORE_FACTORS,
  RATING_PRIOR_COUNT,
  RATING_PRIOR_MEAN,
  RADAR_SCORE_VERSION,
} from "@/lib/radar-score";
import { ECB_RATES_URL } from "@/lib/exchange-rates";

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
          Radar Score is an editorial estimate from 0–100, based on available
          evidence. Method v{RADAR_SCORE_VERSION} puts more weight on quality
          and documented usability. Marketplace stars stay separate. A score is
          not a performance benchmark or a guarantee that an asset fits your
          project.
        </p>
        <table className="score-method-table">
          <thead>
            <tr>
              <th scope="col">What we consider</th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(SCORE_FACTORS).map(({ label, maximum }) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{maximum}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          For rated promotions, quality combines the editorial grade with a
          moderated marketplace average, each weighted equally. We use a
          conservative prior of {RATING_PRIOR_COUNT} ratings at{" "}
          {RATING_PRIOR_MEAN}/5: (rating × count + {RATING_PRIOR_MEAN} ×{" "}
          {RATING_PRIOR_COUNT}) ÷ (count + {RATING_PRIOR_COUNT}). This is a
          scoring assumption, not an observed rating or statistical confidence
          interval. A 5/5 score from six people carries less weight than one
          supported by hundreds.
        </p>
        <p>
          Editorial grades use clear anchors: 3/5 is adequate and earns 50% of
          its factor; 4/5 is strong and earns 75%; 5/5 is exceptional and earns
          100%. Intermediate grades are interpolated. A listing-only contents
          review earns at most 80% of completeness points. Discount contributes
          at most 10 points, calculated from the actual price ratio. CC0 earns
          10 license points, commercial creator/attribution licenses 8, and a
          revenue-limited Personal tier 7. Each factor is rounded to whole
          points.
        </p>
        <p>
          Unrated free assets receive a provisional score: 15 neutral quality
          points, 15 for verified zero-cost commercial access, and zero discount
          points because no former paid price is known. Completeness uses
          checked formats (4), source evidence (4), licensed preview evidence
          (4), documented scope (1), useful editable/interchange formats (up to
          3), and an actual audio sample (2). SVG earns 3 format points; 3D
          FBX/OBJ/GLB interchange earns up to 3; EXR earns 2. A checked
          first-party Kenney or Poly Haven source earns 8 trust points. Large
          file counts and featured placement never inflate quality. Missing
          ratings stay unknown; a lower score can reflect missing evidence
          rather than poor assets.
        </p>
        <p>
          Unrated promotions cannot exceed 15 quality points. Paid deals still
          need at least 30% off, a score of 70, quality and value grades of at
          least 3/5, commercial rights, and at least 4 stars when rated. Each
          asset page shows its points and evidence limitations. These are
          published information checks; no in-engine performance test is
          claimed.
        </p>
      </section>
      <section className="document-section">
        <h2>A small window. A clear price.</h2>
        <p>
          Free Today highlights premium assets temporarily free to claim. Deals
          Radar is a curated selection of paid discounts. Prices are displayed
          in USD with the applicable license tier. Where a source was checked in
          another currency, ≈ marks an estimate converted using dated{" "}
          <a href={ECB_RATES_URL} target="_blank" rel="noopener noreferrer">
            European Central Bank reference rates
          </a>
          . These amounts help comparison; the source determines checkout
          pricing, regional availability and taxes. Original source prices are
          preserved in the verification record.
        </p>
        <p>
          Conversion estimates stop displaying when the reference date is seven
          days old or a currency is unsupported. We show a source-price link
          instead of assuming an exchange rate. Directly verified USD prices do
          not depend on a currency conversion.
        </p>
        <p>
          Expired promotions leave discovery automatically. Promotions also stop
          appearing after 48 hours without a new price and license check. A
          countdown appears only when the source provides a known deadline.
          Promotion previews show credited publisher screenshots when available;
          audio and missing images use an original editorial illustration.
        </p>
      </section>
      <section className="document-section">
        <h2>A library that can keep growing.</h2>
        <p>
          Catalog changes are checked against permitted sources, deduplicated,
          and reviewed before publication. Each asset page links to its original
          publisher, license terms, and the date of its latest check.
        </p>
      </section>
      <Link href="/" className="button primary">
        Find your next idea <ArrowRight size={18} />
      </Link>
    </div>
  );
}
