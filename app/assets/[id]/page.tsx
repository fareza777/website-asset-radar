import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Check,
  CalendarBlank,
  Info,
  FolderSimple,
} from "@phosphor-icons/react/dist/ssr";
import { assets, getAsset } from "@/lib/catalog";
import { formatDate } from "@/lib/catalog-utils";
import { siteUrl, jsonLd } from "@/lib/site";
import { FavoriteButton, AssetCard } from "@/components/asset-card";
import { CollectionPicker } from "@/components/collection-picker";

export const dynamicParams = false;
export function generateStaticParams() {
  return assets.map((asset) => ({ id: asset.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const asset = getAsset(id);
  if (!asset) return {};
  return {
    title: `${asset.title} by ${asset.author} | Free ${asset.assetType}`,
    description: `${asset.summary} ${asset.license} license verified on ${formatDate(asset.verifiedAt)}.`,
    alternates: { canonical: `/assets/${id}/` },
    openGraph: {
      title: `${asset.title} | AssetRadar`,
      description: asset.summary,
      url: `/assets/${id}/`,
      images: [
        { url: asset.preview, width: 800, height: 450, alt: asset.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${asset.title} | AssetRadar`,
      description: asset.summary,
      images: [asset.preview],
    },
  };
}
export default async function AssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = getAsset(id);
  if (!asset) notFound();
  const related = assets
    .filter(
      (a) =>
        a.id !== asset.id &&
        a.categories.some((c) => asset.categories.includes(c)),
    )
    .slice(0, 3);
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
            url: `${siteUrl}/assets/${id}/`,
            image: `${siteUrl}${asset.preview}`,
            license: asset.licenseUrl,
            isAccessibleForFree: true,
            sameAs: asset.sourceUrl,
            dateModified: asset.verifiedAt,
            keywords: asset.tags.join(", "),
          }),
        }}
      />
      <Link href="/" className="back-link">
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
          </div>
          <h1>{asset.title}</h1>
          <p className="detail-author">
            Created by{" "}
            <a href={asset.sourceUrl} target="_blank" rel="noreferrer">
              {asset.author} <ArrowUpRight size={13} />
            </a>
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
            <FavoriteButton asset={asset} large />
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
              <dt>Formats in archive</dt>
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
