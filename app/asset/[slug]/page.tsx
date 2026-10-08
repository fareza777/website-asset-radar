import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FreeAssetPage, {
  generateMetadata as freeMetadata,
} from "@/app/assets/[id]/page";
import { directoryAssets, getDirectoryAsset } from "@/lib/catalog";
import { OfferDetail } from "@/components/offer-detail";
import { directoryMetadata } from "@/lib/discovery-seo";
export const dynamicParams = false;
export function generateStaticParams() {
  return directoryAssets.map((a) => ({ slug: a.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params,
    asset = getDirectoryAsset(slug);
  if (!asset) return {};
  return asset.type === "free"
    ? freeMetadata({ params: Promise.resolve({ id: slug }) })
    : directoryMetadata(
        `${asset.title} by ${asset.author}`,
        `${asset.summary} Source: ${asset.source}. Commercial license and original listing checked.`,
        `/asset/${slug}/`,
      );
}
export default async function AssetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    asset = getDirectoryAsset(slug);
  if (!asset) notFound();
  return asset.type === "free" ? (
    <FreeAssetPage params={Promise.resolve({ id: slug })} />
  ) : (
    <OfferDetail asset={asset} />
  );
}
