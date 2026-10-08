import type { Metadata } from "next";
import { Heart } from "@phosphor-icons/react/dist/ssr";
import { AssetGallery } from "@/components/asset-gallery";
import { directoryAssets } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Your favorite assets",
  description:
    "Your personal collection of favorite free game development assets, saved locally in your browser.",
  alternates: { canonical: "/favorites/" },
  robots: { index: false, follow: true },
};
export default function Favorites() {
  return (
    <>
      <div className="page-intro">
        <span className="page-intro-icon">
          <Heart size={27} weight="duotone" />
        </span>
        <h1>The ones you keep coming back to.</h1>
        <p>
          Your favorite finds, all in one place. Saved in this browser, without
          an account.
        </p>
      </div>
      <AssetGallery
        assets={directoryAssets}
        favoritesOnly
        heading="Your favorites"
      />
    </>
  );
}
