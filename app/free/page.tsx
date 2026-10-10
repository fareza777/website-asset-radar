import { AssetGallery } from "@/components/catalog-gallery";
import { assets } from "@/lib/catalog";
import { directoryMetadata, DirectorySchema } from "@/lib/discovery-seo";
export const metadata = directoryMetadata(
  "Free game assets with verified licenses",
  "Browse curated, permanently free game assets. Filter 2D art, 3D models, UI, textures and audio by genre, engine, license and source.",
  "/free/",
);
export default function FreeAssets() {
  return (
    <>
      <DirectorySchema title="Free game assets" path="/free/" assets={assets} />
      <div className="page-intro">
        <span className="intro-category">THE PERMANENT FREE LIBRARY</span>
        <h1>Great pieces. Zero price tag.</h1>
        <p>
          Curated free assets, clear licenses, and a head start for your next
          game.
        </p>
      </div>
      <AssetGallery assets={assets} scope={{ type: "free" }} heading="Free assets" />
    </>
  );
}
