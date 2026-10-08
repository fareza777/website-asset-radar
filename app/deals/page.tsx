import Link from "next/link";
import { Tag } from "@phosphor-icons/react/dist/ssr";
import { AssetGallery } from "@/components/asset-gallery";
import { offers } from "@/lib/catalog";
import { offerStatus } from "@/lib/offer-utils";
import { directoryMetadata, DirectorySchema } from "@/lib/discovery-seo";
export const metadata = directoryMetadata(
  "Deals Radar — curated game asset discounts",
  "Discover worthwhile premium game asset deals with verified sale prices, discounts, marketplace ratings and commercial licenses. Curated with Radar Score.",
  "/deals/",
);
// Static discovery schema is a build snapshot; browser availability stays live.
const builtAt = Date.now();
export default function Deals() {
  const items = offers.filter(
    (a) => a.type === "deal" && offerStatus(a, builtAt) === "active",
  );
  return (
    <>
      <DirectorySchema
        title="Curated premium game asset deals"
        path="/deals/"
        assets={items}
      />
      <div className="page-intro">
        <span className="page-intro-icon">
          <Tag size={29} weight="duotone" />
        </span>
        <h1>A better deal. A better toolkit.</h1>
        <p>
          Quality packs with a meaningful discount. A short list of useful
          finds, selected for value and commercial usability.
        </p>
      </div>
      <AssetGallery
        assets={offers.filter((a) => a.type === "deal")}
        offerMode="deal"
        heading="Deals Radar"
      />
      <p className="discovery-note">
        At least 30% off and a Radar Score of 70+.{" "}
        <Link className="text-link" href="/about/#radar-score">
          How we score a find
        </Link>
      </p>
    </>
  );
}
