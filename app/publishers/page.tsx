import { FeaturedPublishers } from "@/components/featured-publishers";
import { directoryMetadata } from "@/lib/discovery-seo";
import { publishers } from "@/lib/publishers";
import { jsonLd, siteUrl } from "@/lib/site";

export const metadata = directoryMetadata("Featured game asset publishers", "Explore Synty, Kenney, Quaternius, NatureManufacture, polyperfect, KayKit, Infinity PBR, CraftPix, Ansimuz and Pixel Frog. Official sources and verified catalog coverage.", "/publishers/");
export default function PublisherDirectory() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Featured game asset publishers", url: `${siteUrl}/publishers/`, mainEntity: { "@type": "ItemList", itemListElement: publishers.map((publisher, index) => ({ "@type": "ListItem", position: index + 1, name: publisher.name, url: `${siteUrl}/publisher/${publisher.id}/` })) } }) }} /><div className="page-intro"><span className="intro-category">DISTINCTIVE WORK. ORIGINAL CREATORS.</span><h1>Know who made<br /><span className="accent-text">your next great find.</span></h1><p>Explore ten selected publishers. Profiles link to official catalogs; asset listings appear after individual verification.</p></div><FeaturedPublishers full /><p className="discovery-note">An independent editorial selection. Featured does not imply an official partnership or that every publisher currently has verified deals.</p></>;
}
