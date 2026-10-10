import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ShieldCheck } from "@/lib/icons";
import { publishers, getPublisher, matchesPublisher } from "@/lib/publishers";
import { assets, offers } from "@/lib/catalog";
import { AssetGallery } from "@/components/catalog-gallery";
import { directoryMetadata, DirectorySchema } from "@/lib/discovery-seo";
import { jsonLd, siteUrl } from "@/lib/site";
import { formatDate } from "@/lib/catalog-utils";
import { offerStatus } from "@/lib/offer-utils";
import { PublisherEmblem } from "@/components/publisher-emblem";

export const dynamicParams = false;
export function generateStaticParams() { return publishers.map((publisher) => ({ slug: publisher.id })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publisher = getPublisher(slug);
  return publisher ? directoryMetadata(`${publisher.name} game assets`, `${publisher.summary} Explore official sources and individually verified free assets or promotions on Game Asset Radar.`, `/publisher/${publisher.id}/`) : {};
}
const builtAt = Date.now();
export default async function PublisherPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publisher = getPublisher(slug);
  if (!publisher) notFound();
  const items = [...assets, ...offers].filter((asset) => matchesPublisher(asset, publisher.id));
  const verified = items.filter((asset) => asset.type === "free" || offerStatus(asset, builtAt) === "active");
  return <>
    <DirectorySchema title={`${publisher.name} verified assets`} path={`/publisher/${publisher.id}/`} assets={verified} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "ProfilePage", name: `${publisher.name} publisher profile`, url: `${siteUrl}/publisher/${publisher.id}/`, dateModified: publisher.profileCheckedAt, mainEntity: { "@type": "Organization", name: publisher.name, url: publisher.officialUrl, description: publisher.summary } }) }} />
    <Link className="back-link" href="/publishers/"><ArrowLeft size={17} /> All publishers</Link>
    <div className="publisher-profile-header"><PublisherEmblem publisherId={publisher.id} profile /><div><span className="section-kicker">FEATURED PUBLISHER · {publisher.specialty}</span><h1>{publisher.name}</h1><p>{publisher.summary}</p><a href={publisher.catalogUrl} target="_blank" rel="noopener noreferrer" className="button primary">Official catalog <ArrowUpRight size={18} /></a></div></div>
    <div className="publisher-license-note"><ShieldCheck size={23} /><div><strong>Check the exact pack.</strong><p>{publisher.licenseNote}</p><a className="text-link" href={publisher.evidenceUrl} target="_blank" rel="noopener noreferrer">Official profile evidence <ArrowUpRight size={15} /></a><span className="profile-check-date">Profile checked {formatDate(publisher.profileCheckedAt)} · Product checks are recorded separately.</span></div></div>
    {items.length ? <AssetGallery assets={items} scope={{ publisher: publisher.id }} heading={`Verified ${publisher.name} assets`} /> : <section className="publisher-coverage-empty"><span className="section-kicker">CATALOG COVERAGE</span><h2>Individual listings are still being verified.</h2><p>No {publisher.name} assets have passed our catalog checks yet. Explore the official catalog now; verified free packs and qualifying promotions will appear here as they are added.</p><div><a href={publisher.catalogUrl} className="text-link" target="_blank" rel="noopener noreferrer">Visit {publisher.name} <ArrowUpRight size={17} /></a><Link href="/explore/" className="text-link">Browse verified discoveries <ArrowUpRight size={17} /></Link></div></section>}
  </>;
}
