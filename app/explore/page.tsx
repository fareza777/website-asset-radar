import { AssetGallery } from "@/components/catalog-gallery";
import { assets, offers } from "@/lib/catalog";
import { offerStatus } from "@/lib/offer-utils";
import { directoryMetadata, DirectorySchema } from "@/lib/discovery-seo";

export const metadata = directoryMetadata("Find game assets — advanced search", "Search verified free game assets, limited-time freebies and curated discounts. Combine engine, publisher, genre, license, file format and discount filters.", "/explore/");
const builtAt = Date.now();
export default function Explore() {
  const catalog = [...assets, ...offers];
  return <><DirectorySchema title="Game asset discovery" path="/explore/" assets={catalog.filter((asset) => asset.type === "free" || offerStatus(asset, builtAt) === "active")} /><div className="page-intro explore-intro"><span className="intro-category">MAKE THE RADAR YOURS</span><h1>The right pieces.<br /><span className="accent-text">For your next idea.</span></h1><p>Free assets, limited-time finds, and worthwhile upgrades. One search, every useful filter.</p></div><AssetGallery assets={catalog} scope={{}} heading="Your discoveries" /></>;
}
