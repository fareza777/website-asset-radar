"use client";

import Image from "next/image";
import { useState } from "react";
import type { Promotion } from "@/lib/types";
import { EditorialCover } from "./editorial-cover";

export function OfferPreview({
  asset,
  priority = false,
  showCaption = false,
}: {
  asset: Promotion;
  priority?: boolean;
  showCaption?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const publisher = asset.publisherPreview;
  const src = publisher?.url ?? asset.preview;
  const fallback = !src || failedSource === src;
  return (
    <>
      {fallback ? (
        <EditorialCover asset={asset} />
      ) : (
        <div
          className={`offer-preview ${publisher ? "publisher-preview" : ""}`}
        >
          <Image
            src={src!}
            alt={publisher?.alt ?? `${asset.title} preview`}
            width={800}
            height={450}
            className="asset-image"
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
            preload={priority}
            referrerPolicy="no-referrer"
            onError={() => setFailedSource(src)}
          />
          {publisher && (
            <span className="publisher-credit">
              Publisher preview · {publisher.credit}
            </span>
          )}
        </div>
      )}
      {showCaption && (
        <div className="preview-credit">
          <span>
            {fallback
              ? "Original editorial illustration. Product artwork is available at the source."
              : publisher
                ? `Preview by ${publisher.credit}. Inspect the source for the full gallery and included contents.`
                : `Thumbnail: ${asset.thumbnailPermission!.license}`}
          </span>
        </div>
      )}
    </>
  );
}
