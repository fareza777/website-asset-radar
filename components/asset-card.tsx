"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart as HeartIcon,
  ArrowUpRight as ArrowUpRightIcon,
  SealCheck as SealCheckIcon,
  Cube as CubeIcon,
  ImageSquare as ImageSquareIcon,
  Waveform as WaveformIcon,
} from "@phosphor-icons/react";
import { useLibrary } from "./library-provider";
import type { Asset } from "@/lib/types";

export function FavoriteButton({
  asset,
  large = false,
}: {
  asset: Pick<Asset, "id" | "title">;
  large?: boolean;
}) {
  const { favorites, toggleFavorite, notify } = useLibrary();
  const saved = favorites.includes(asset.id);
  return (
    <button
      type="button"
      className={`${large ? "button secondary save-large" : "favorite-button"} ${saved ? "saved" : ""}`}
      aria-label={`${saved ? "Remove" : "Save"} ${asset.title} ${saved ? "from" : "to"} favorites`}
      aria-pressed={saved}
      onClick={() => {
        const added = toggleFavorite(asset.id);
        notify(added ? "Saved to your favorites" : "Removed from favorites");
      }}
    >
      <HeartIcon size={large ? 20 : 19} weight={saved ? "fill" : "regular"} />
      {large && <span>{saved ? "Saved to favorites" : "Save asset"}</span>}
    </button>
  );
}

export function AssetCard({
  asset,
  view = "grid",
  priority = false,
}: {
  asset: Asset;
  view?: "grid" | "list";
  priority?: boolean;
}) {
  const DimensionIcon =
    asset.dimension === "3D"
      ? CubeIcon
      : asset.dimension === "Audio"
        ? WaveformIcon
        : ImageSquareIcon;
  return (
    <article className={`asset-card ${view === "list" ? "list-card" : ""}`}>
      <div className="asset-image-wrap">
        <Link href={`/assets/${asset.id}/`} tabIndex={-1} aria-hidden="true">
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
      </div>
      <div className="asset-card-body">
        <div className="asset-card-heading">
          <Link className="asset-title" href={`/assets/${asset.id}/`}>
            {asset.title}
            <ArrowUpRightIcon className="card-arrow" size={15} />
          </Link>
          <span className="free-label">Free</span>
        </div>
        <p className="asset-author">
          by {asset.author}
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
        </div>
      </div>
    </article>
  );
}
