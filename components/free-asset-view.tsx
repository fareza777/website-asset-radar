"use client";

import Image from "next/image";
import Link from "next/link";
import { EngineCompatibilityPanel } from "@/components/engine-compatibility";
import { PublisherCredit } from "@/components/publisher-credit";
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Check,
  CalendarBlank,
  Info,
  FolderSimple,
} from "@/lib/icons";
import { formatDate } from "@/lib/catalog-utils";
import { siteUrl, jsonLd } from "@/lib/site";
import { FavoriteButton, AssetCard } from "@/components/asset-card";
import { CollectionPicker } from "@/components/collection-picker";
import { RadarBadge } from "@/components/radar-badge";
import { RadarScoreBreakdown } from "@/components/score-breakdown";
import { AssetBreadcrumb } from "@/lib/discovery-seo";
import type { CardFreeAsset } from "@/lib/catalog-card";
import type { Asset } from "@/lib/types";

// Prerendered HTML remains complete and indexable. A small per-asset record
// hydrates this shared view instead of copying its entire element tree into
// every static navigation payload. No full-catalog import belongs here.
export function FreeAssetView({
  asset,
  related,
}: {
  asset: Asset;
  related: CardFreeAsset[];
}) {
  const id = asset.id;
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
            author:
              asset.source === "Kenney"
                ? { "@type": "Organization", name: asset.author }
                : (asset.authors ?? [asset.author]).map((name) => ({
                    "@type": "Person",
                    name,
                  })),
            url: `${siteUrl}/asset/${id}/`,
            image: `${siteUrl}${asset.preview}`,
            license: asset.licenseUrl,
            ...(asset.attribution ? { creditText: asset.attribution } : {}),
            isAccessibleForFree: true,
            sameAs: asset.sourceUrl,
            dateModified: asset.verifiedAt,
            keywords: asset.tags.join(", "),
          }),
        }}
      />
      <AssetBreadcrumb title={asset.title} id={asset.id} type="free" />
      <Link href="/free/" className="back-link">
        <ArrowLeft size={17} /> Back to the library
      </Link>
      <div className="asset-detail">
        <div className="asset-detail-media">
          <Image
            src={asset.preview}
            alt={`${asset.title} preview from licensed source files`}
            width={800}
            height={450}
            priority
            sizes="(max-width: 900px) 100vw, 55vw"
          />
          <div className="preview-credit">
            <FolderSimple size={15} />
            <span>
              {asset.previewProvenance.file} from {asset.author}&apos;s licensed
              asset files
            </span>
          </div>
          {asset.audioPreview && (
            <div className="audio-sample">
              <audio
                controls
                preload="none"
                aria-label={`${asset.title} audio sample`}
              >
                <source src={asset.audioPreview} type="audio/ogg" />
                <a href={asset.audioPreview}>Listen to the audio sample</a>
              </audio>
              <p>
                One original sound from the pack. The full collection is
                available at the source.
              </p>
            </div>
          )}
        </div>
        <div className="asset-detail-info">
          <div className="detail-tags">
            <span>{asset.dimension}</span>
            <span>{asset.assetType}</span>
            <span className="license-badge">{asset.license}</span>
            <RadarBadge score={asset.radarScore} provisional />
          </div>
          <h1>{asset.title}</h1>
          <p className="detail-author">
            Created by <PublisherCredit asset={asset} />
          </p>
          <p className="detail-summary">{asset.summary}</p>
          <a
            className="button primary download-button"
            href={asset.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Get the free asset <ArrowUpRight size={20} />
          </a>
          <span className="download-note">
            Download directly from {asset.source}. Support the original creator.
          </span>
          <div className="detail-save-actions">
            <FavoriteButton
              asset={{ id: asset.id, title: asset.title }}
              large
            />
            <CollectionPicker assetId={asset.id} />
          </div>
          <div className="detail-verified">
            <ShieldCheck size={19} weight="duotone" />
            <div>
              <strong>Source & license verified</strong>
              <span>Last checked {formatDate(asset.verifiedAt)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="detail-content">
        <section className="detail-facts">
          <h2>The useful details.</h2>
          <dl>
            <div>
              <dt>Asset type</dt>
              <dd>{asset.assetType}</dd>
            </div>
            <div>
              <dt>Dimension</dt>
              <dd>{asset.dimension}</dd>
            </div>
            {asset.fileCount && (
              <div>
                <dt>Publisher-listed files</dt>
                <dd>{asset.fileCount}</dd>
              </div>
            )}
            <div>
              <dt>Verified content formats</dt>
              <dd>{asset.formats.join(" · ")}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>
                <a href={asset.sourceUrl} target="_blank" rel="noreferrer">
                  {asset.source} <ArrowUpRight size={13} />
                </a>
              </dd>
            </div>
            <div>
              <dt>Added to the library</dt>
              <dd>{formatDate(asset.addedAt)}</dd>
            </div>
          </dl>
          <div className="engine-notice">
            <Info size={18} />
            <p>{asset.engineNote}</p>
          </div>
          <div className="detail-source-tags">
            <h3>Publisher tags</h3>
            <div>
              {asset.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </section>
        <section className="license-panel">
          <div className="license-panel-heading">
            <ShieldCheck size={27} weight="duotone" />
            <div>
              <span>{asset.license} LICENSE</span>
              <h2>
                {asset.license === "CC0"
                  ? "Make it your own."
                  : "Create with credit."}
              </h2>
            </div>
          </div>
          <p>
            {asset.license === "CC0"
              ? "This asset is dedicated to the public domain. Use and modify it in personal and commercial projects without required attribution."
              : "Use and modify this asset with attribution to its creator under the license terms."}
          </p>
          <div className="license-permissions">
            <span>
              <Check size={16} /> Commercial use
            </span>
            <span>
              <Check size={16} /> Modification
            </span>
            <span>
              <Check size={16} />{" "}
              {asset.license === "CC0"
                ? "No credit required"
                : "Attribution required"}
            </span>
          </div>
          {asset.attribution && (
            <div className="evidence-block attribution-block">
              <strong>Creator credit & preview attribution</strong>
              <p>{asset.attribution}</p>
              <p>{asset.previewProvenance.note}</p>
            </div>
          )}
          <RadarScoreBreakdown asset={asset} />
          <div className="evidence-block">
            <strong>Verification evidence</strong>
            <p>{asset.evidence}</p>
            <a href={asset.verificationUrl} target="_blank" rel="noreferrer">
              Inspect source evidence <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="license-panel-footer">
            <span>
              <CalendarBlank size={15} /> {formatDate(asset.verifiedAt)}
            </span>
            <a href={asset.licenseUrl} target="_blank" rel="noreferrer">
              Read full license <ArrowUpRight size={14} />
            </a>
          </div>
        </section>
      </div>
      <EngineCompatibilityPanel asset={asset} />
      <section className="related-section">
        <div className="collections-heading">
          <div>
            <h2>Keep the ideas coming.</h2>
            <p>A few more assets for a world like yours.</p>
          </div>
          <Link href="/" className="text-link">
            Explore the library <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="asset-grid">
          {related.map((item) => (
            <AssetCard key={item.id} asset={item} />
          ))}
        </div>
      </section>
    </>
  );
}
