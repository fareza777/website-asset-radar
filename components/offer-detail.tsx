import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Info,
} from "@phosphor-icons/react/dist/ssr";
import type { Promotion } from "@/lib/types";
import { formatDate } from "@/lib/catalog-utils";
import { scoreBreakdown } from "@/lib/offer-utils";
import { jsonLd, siteUrl } from "@/lib/site";
import { OfferPreview } from "./offer-preview";
import { OfferAvailability } from "./offer-availability";
import { FavoriteButton } from "./favorite-button";
import { CollectionPicker } from "./collection-picker";
import { RadarBadge } from "./radar-badge";
import { AssetBreadcrumb } from "@/lib/discovery-seo";

export function OfferDetail({ asset }: { asset: Promotion }) {
  const scores = scoreBreakdown(asset);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: asset.title,
            description: asset.summary,
            author: { "@type": "Organization", name: asset.author },
            url: `${siteUrl}/asset/${asset.id}/`,
            license: asset.licenseUrl,
            sameAs: asset.canonicalSourceUrl,
            dateModified: asset.lastChecked,
            keywords: asset.tags.join(", "),
          }),
        }}
      />
      <AssetBreadcrumb title={asset.title} id={asset.id} type={asset.type} />
      <Link
        href={asset.type === "limited_free" ? "/free-today/" : "/deals/"}
        className="back-link"
      >
        <ArrowLeft size={17} />
        Back to {asset.type === "limited_free" ? "Free Today" : "Deals"}
      </Link>
      <div className="asset-detail">
        <div className="asset-detail-media">
          <OfferPreview asset={asset} priority showCaption />
          <a
            href={asset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link publisher-preview-link"
          >
            View publisher previews
            <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="asset-detail-info">
          <div className="detail-tags">
            <span>{asset.dimension}</span>
            <span>{asset.assetType}</span>
            <RadarBadge score={asset.radarScore} />
          </div>
          <h1>{asset.title}</h1>
          <p className="detail-author">
            Created by {asset.author} · {asset.source}
          </p>
          <p className="detail-summary">{asset.summary}</p>
          <OfferAvailability asset={asset} />
          <div className="detail-save-actions">
            <FavoriteButton asset={asset} large />
            <CollectionPicker assetId={asset.id} />
          </div>
          <div className="detail-verified">
            <ShieldCheck size={20} weight="duotone" />
            <div>
              <strong>Price, source & license checked</strong>
              <span>
                Last checked{" "}
                <time dateTime={asset.lastChecked}>
                  {formatDate(asset.lastChecked)}
                </time>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="detail-content">
        <section className="detail-facts">
          <h2>The useful details.</h2>
          <dl>
            <div>
              <dt>Marketplace</dt>
              <dd>{asset.source}</dd>
            </div>
            <div>
              <dt>Asset type</dt>
              <dd>{asset.assetType}</dd>
            </div>
            <div>
              <dt>Publisher-listed formats</dt>
              <dd>{asset.formats.join(" · ")}</dd>
            </div>
            <div>
              <dt>License tier</dt>
              <dd>{asset.licenseTier ?? "Creator license"}</dd>
            </div>
            <div>
              <dt>Commercial use</dt>
              <dd>
                {asset.commercialUse
                  ? "Allowed under the source license"
                  : "Not verified"}
              </dd>
            </div>
            <div>
              <dt>Marketplace rating</dt>
              <dd>
                {asset.rating === null
                  ? "Not published"
                  : `${asset.rating} / 5 · ${asset.reviewCount} ratings`}
              </dd>
            </div>
            <div>
              <dt>Added to the radar</dt>
              <dd>{formatDate(asset.addedAt)}</dd>
            </div>
          </dl>
          <div className="engine-notice">
            <Info size={19} />
            <p>{asset.engineNote}</p>
          </div>
          <div className="offer-curation">
            <h3>Why it made the radar</h3>
            <p>{asset.curation.rationale}</p>
          </div>
        </section>
        <section className="license-panel">
          <div className="license-panel-heading">
            <ShieldCheck size={28} weight="duotone" />
            <div>
              <span>VERIFIED COMMERCIAL TERMS</span>
              <h2>{asset.license}</h2>
            </div>
          </div>
          <p>{asset.licenseNote}</p>
          <a
            href={asset.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Read the source license
            <ArrowUpRight size={16} />
          </a>
          <div className="score-breakdown">
            <h3>Radar Score {asset.radarScore} / 100</h3>
            <dl>
              {Object.entries(scores).map(([label, value]) => (
                <div key={label}>
                  <dt>
                    {label === "reputation" ? "Creator / source trust" : label}
                  </dt>
                  <dd>
                    {value} /{" "}
                    {label === "quality"
                      ? 25
                      : label === "value" || label === "license"
                        ? 20
                        : label === "discount"
                          ? 15
                          : 10}
                  </dd>
                </div>
              ))}
            </dl>
            <Link href="/about/#radar-score" className="text-link">
              Read the scoring method
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="evidence-block">
            <strong>Verification evidence</strong>
            <p>
              Publisher prices, product details and license were inspected on{" "}
              {formatDate(asset.lastChecked)}. Price tier:{" "}
              {asset.licenseTier ?? "standard creator offering"}.
            </p>
            <a
              href={asset.canonicalSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Inspect original listing
              <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
