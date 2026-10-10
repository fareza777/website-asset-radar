import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { assets, getAsset } from "@/lib/catalog";
import { formatDate } from "@/lib/catalog-utils";
import { toCardAsset } from "@/lib/catalog-card";
import { FreeAssetView } from "./free-asset-view";

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
    alternates: { canonical: `/asset/${id}/` },
    openGraph: {
      title: `${asset.title} | Game Asset Radar`,
      description: asset.summary,
      url: `/asset/${id}/`,
      images: [
        { url: asset.preview, width: 800, height: 450, alt: asset.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${asset.title} | Game Asset Radar`,
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
        a.dimension === asset.dimension &&
        a.assetType === asset.assetType &&
        a.categories.some((c) => asset.categories.includes(c)),
    )
    .slice(0, 3);
  return (
    <FreeAssetView
      asset={asset}
      related={related.map((item) => toCardAsset(item))}
    />
  );
}
