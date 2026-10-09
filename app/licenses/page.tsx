import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowUpRight,
  Check,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Game asset licenses & verified sources",
  description:
    "Understand CC0 and CC BY game asset licenses, creator attribution, and Game Asset Radar's source and preview verification.",
  alternates: { canonical: "/licenses/" },
};
export default function Licenses() {
  return (
    <div className="document-page">
      <div className="page-intro">
        <span className="page-intro-icon">
          <ShieldCheck size={29} weight="duotone" />
        </span>
        <h1>Know what you can create.</h1>
        <p>
          Free is a price. A license tells you what you can do with an asset.
        </p>
      </div>
      <section className="document-section license-explainer">
        <span className="license-badge">CC0 1.0</span>
        <h2>Public domain. Open possibilities.</h2>
        <p>
          CC0 lets you use, modify, and redistribute an asset for personal or
          commercial purposes without required attribution. Giving the creator
          credit is still a thoughtful way to say thanks.
        </p>
        <div className="license-permissions">
          <span>
            <Check size={17} /> Commercial projects
          </span>
          <span>
            <Check size={17} /> Modification
          </span>
          <span>
            <Check size={17} /> Redistribution
          </span>
          <span>
            <Check size={17} /> No credit required
          </span>
        </div>
        <a
          className="text-link"
          href="https://creativecommons.org/publicdomain/zero/1.0/"
          target="_blank"
          rel="noreferrer"
        >
          Read the official CC0 terms <ArrowUpRight size={15} />
        </a>
      </section>
      <section className="document-section">
        <span className="license-badge">CC BY 3.0 / 4.0</span>
        <h2>Free to create. Keep the credit.</h2>
        <p>
          CC BY allows commercial use and modification under its terms. Keep
          the creator&apos;s credit and supplied notices, link to the applicable
          license, and identify your changes. Do not add restrictions that
          prevent others from exercising the licensed rights.
        </p>
        <p>
          Each asset page preserves the creator&apos;s attribution instructions
          and identifies our preview changes. Check the exact license version
          attached to your download.
        </p>
        <a className="text-link" href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
          Read CC BY 3.0 <ArrowUpRight size={15} />
        </a>{" · "}
        <a className="text-link" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
          Read CC BY 4.0 <ArrowUpRight size={15} />
        </a>
      </section>
      <section className="document-section">
        <h2>What “verified” means here.</h2>
        <p>
          Each catalog entry records the original publisher page, explicit
          license evidence, and the day we checked it. For Kenney packs, we
          check the source page and the license included in the archive. For
          Poly Haven, we use its permitted public API and published asset
          license. For ambientCG materials, we verify its official API and
          license covering the asset files and preview renders; full archives
          and engine performance are not tested. OpenGameArt submissions need
          their own author and license evidence plus an inspected asset download;
          their website gallery images are excluded.
        </p>
        <p>
          Genre tags are editorial suggestions. Engine filters indicate
          supported file formats, rather than an official integration or a
          promise of a ready-to-run project. “Latest” means newly added to this
          catalog.
        </p>
        <p>
          A check describes the source at that time. A source can change later.
          Use the linked evidence and the license included with your downloaded
          files before publishing your game.
        </p>
      </section>
      <section className="document-section">
        <h2>Good assets start with good sources.</h2>
        <div className="source-cards">
          <a href="https://opengameart.org/content/faq" target="_blank" rel="noreferrer">
            <strong>OpenGameArt <ArrowUpRight size={18} /></strong>
            <p>Independent creators&apos; assets under verified CC0 or CC BY licenses, with credit and previews from licensed download files.</p>
            <span>Submission license + inspected asset download</span>
          </a>
          <a href="https://kenney.nl/support" target="_blank" rel="noreferrer">
            <strong>
              Kenney <ArrowUpRight size={18} />
            </strong>
            <p>
              Free 2D, 3D, UI, and audio packs. CC0 confirmed on each pack page
              and in its archive.
            </p>
            <span>Source pages + included license files</span>
          </a>
          <a
            href="https://polyhaven.com/license"
            target="_blank"
            rel="noreferrer"
          >
            <strong>
              Poly Haven <ArrowUpRight size={18} />
            </strong>
            <p>
              CC0 textures and 3D assets. Discovery uses the public API, and our
              previews come from asset files.
            </p>
            <span>Permitted API + public asset license</span>
          </a>
          <a href="https://docs.ambientcg.com/license/" target="_blank" rel="noreferrer">
            <strong>ambientCG <ArrowUpRight size={18} /></strong>
            <p>CC0 materials with publisher-listed texture formats and explicitly licensed material preview renders.</p>
            <span>Official material API + asset and preview license</span>
          </a>
        </div>
      </section>
      <section className="document-section">
        <h2>Creators come first.</h2>
        <p>
          Game Asset Radar links you to the original source for downloads. Preview
          provenance is stored in the catalog. We do not copy paid packs,
          restricted artwork, creator logos, or website example renders without
          permission. Free-asset previews come from licensed files. Promotion
          screenshots link to publisher galleries with creator credit; audio and
          missing images use original illustrations.
        </p>
        <p>
          We add an asset only when its source and license can be verified.
          Ambiguous licenses, contradictory terms, and failed checks stay
          outside the verified catalog.
        </p>
        <Link href="/cc0/" className="button primary">
          Find a free starting point <ArrowRight size={18} />
        </Link>
      </section>
      <section className="document-section">
        <h2>Free to claim, with a source license.</h2>
        <p>
          A limited-time free price does not turn a premium asset into CC0. Fab
          assets on this radar use the Fab Standard License and the indicated
          pricing tier. Creator assets on itch.io use the license attached to
          that particular listing. Each promotion page links to its commercial
          terms and any restrictions on redistribution.
        </p>
        <a
          className="text-link"
          href="https://www.fab.com/eula"
          target="_blank"
          rel="noreferrer"
        >
          Read the Fab Standard License
          <ArrowUpRight size={16} />
        </a>
      </section>
    </div>
  );
}
