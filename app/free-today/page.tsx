import { Fire } from "@/lib/icons";
import { AssetGallery } from "@/components/catalog-gallery";
import { offers } from "@/lib/catalog";
import { offerStatus } from "@/lib/offer-utils";
import { directoryMetadata, DirectorySchema } from "@/lib/discovery-seo";
export const metadata = directoryMetadata(
  "Free Today — limited-time free game assets",
  "Find premium game assets temporarily offered for free. Check verified original prices, commercial licenses, marketplaces and known claim deadlines.",
  "/free-today/",
);
// Static discovery schema is a build snapshot; browser availability stays live.
const builtAt = Date.now();
export default function FreeToday() {
  const items = offers.filter(
    (a) => a.type === "limited_free" && offerStatus(a, builtAt) === "active",
  );
  return (
    <>
      <DirectorySchema
        title="Limited-time free game assets"
        path="/free-today/"
        assets={items}
      />
      <div className="page-intro">
        <span className="page-intro-icon">
          <Fire size={29} weight="duotone" />
        </span>
        <h1>Good finds. A small window.</h1>
        <p>
          Premium assets temporarily free to claim. Verified prices and
          commercial terms, with deadlines where the source provides them.
        </p>
      </div>
      <AssetGallery
        assets={offers.filter((a) => a.type === "limited_free")}
        scope={{ type: "limited_free" }}
        offerMode="limited_free"
        heading="Free Today"
      />
      <p className="discovery-note">
        Free Today means free during the current promotion. Claim at the
        original marketplace to add it to your library.
      </p>
    </>
  );
}
