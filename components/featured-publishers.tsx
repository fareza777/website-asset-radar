import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { publishers } from "@/lib/publishers";

export function FeaturedPublishers({ full = false }: { full?: boolean }) {
  return <section className={`discovery-section featured-publishers ${full ? "full-publisher-directory" : ""}`} aria-labelledby="publishers-heading">
    <div className="discovery-heading"><div><span className="section-kicker">THE PEOPLE BEHIND THE PIECES</span><h2 id="publishers-heading">Featured Publishers</h2><p>Ten distinctive catalogs worth exploring. Every pack gets its own checks.</p></div>{!full && <Link className="text-link" href="/publishers/">Meet all 10 <ArrowRight size={17} /></Link>}</div>
    <div className="publisher-grid">{publishers.map((publisher, index) => <Link key={publisher.id} href={`/publisher/${publisher.id}/`} className={`publisher-tile publisher-${publisher.id}`}>
      <div className="publisher-tile-top"><span className="publisher-monogram" aria-hidden="true">{publisher.initials}</span><span className="publisher-coordinate" aria-hidden="true">{String(index + 1).padStart(2, "0")} / 10</span><ArrowUpRight size={18} /></div>
      <strong>{publisher.name}</strong><span className="publisher-specialty">{publisher.specialty}</span>{full && <p>{publisher.summary}</p>}
    </Link>)}</div>
  </section>;
}
