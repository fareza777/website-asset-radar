import type { Metadata } from "next";
import { AssetGallery } from "@/components/asset-gallery";
import { assets } from "@/lib/catalog";
import { Clock } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Latest free game assets",
  description:
    "Explore the latest additions to Game Asset Radar's verified free game asset catalog, sorted by the date they were added to the library.",
  alternates: { canonical: "/latest/" },
};
export default function Latest() {
  return (
    <>
      <div className="page-intro">
        <span className="page-intro-icon">
          <Clock size={26} weight="duotone" />
        </span>
        <h1>Fresh on the radar.</h1>
        <p>
          The latest additions to the library. A new starting point for your
          next idea.
        </p>
        <span className="intro-note">
          Sorted by catalog addition, not the publisher&apos;s release date.
        </span>
      </div>
      <AssetGallery
        assets={assets}
        initialFilters={{ sort: "latest" }}
        heading="Latest assets"
      />
    </>
  );
}
