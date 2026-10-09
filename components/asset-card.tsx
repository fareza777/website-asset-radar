"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight as ArrowUpRightIcon,
  SealCheck as SealCheckIcon,
  Cube as CubeIcon,
  ImageSquare as ImageSquareIcon,
  Waveform as WaveformIcon,
} from "@phosphor-icons/react";
import type { DirectoryAsset } from "@/lib/types";
import { FavoriteButton } from "./favorite-button";
import { RadarBadge } from "./radar-badge";
import { OfferCard } from "./offer-card";
import { EngineChips } from "./engine-compatibility";
import { PublisherCredit } from "./publisher-credit";
export { FavoriteButton } from "./favorite-button";

export function AssetCard({
  asset,
  view = "grid",
  priority = false,
  preferredEngine,
}: {
  asset: DirectoryAsset;
  view?: "grid" | "list";
  priority?: boolean;
  preferredEngine?: string;
}) {
  if (asset.type !== "free") return <OfferCard asset={asset} view={view} preferredEngine={preferredEngine} />;
  const DimensionIcon =
    asset.dimension === "3D"
      ? CubeIcon
      : asset.dimension === "Audio"
        ? WaveformIcon
        : ImageSquareIcon;
  return (
    <article className={`asset-card ${view === "list" ? "list-card" : ""}`}>
      <div className="asset-image-wrap">
        <Link href={`/asset/${asset.id}/`} tabIndex={-1} aria-hidden="true">
          <Image
            src={asset.preview}
            alt={`${asset.title} asset pack preview`}
            width={800}
            height={450}
            sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
            loading={priority ? "eager" : "lazy"}
            className="asset-image"
          />
        </Link>
        <FavoriteButton asset={asset} />
        <div className="image-radar-badge">
          <RadarBadge score={asset.radarScore} provisional />
        </div>
      </div>
      <div className="asset-card-body">
        <div className="asset-card-heading">
          <Link className="asset-title" href={`/asset/${asset.id}/`}>
            {asset.title}
            <ArrowUpRightIcon className="card-arrow" size={15} />
          </Link>
          <span className="free-label">FREE</span>
        </div>
        <p className="asset-author">
          by <PublisherCredit asset={asset} />
          <SealCheckIcon
            size={13}
            weight="fill"
            aria-label="License verified"
          />
        </p>
        {view === "list" && (
          <p className="asset-list-summary">{asset.summary}</p>
        )}
        <div className="asset-card-meta">
          <span>
            <DimensionIcon size={14} />
            {asset.dimension === "Audio" ? "Audio" : asset.dimension}
          </span>
          <span>
            {asset.assetType === "3D Models" ? "Models" : asset.assetType}
          </span>
          <span className="license-badge">
            {asset.license === "CC0" ? "CC0" : "CC BY"}
          </span>
          {view === "list" && <RadarBadge score={asset.radarScore} provisional />}
        </div>
        <EngineChips asset={asset} preferredEngine={preferredEngine} />
      </div>
    </article>
  );
}
