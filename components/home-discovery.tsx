import Link from "next/link";
import {
  ArrowRight,
  Star,
  Clock,
  MagnifyingGlass,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";
import type { Asset } from "@/lib/types";
import { categories } from "@/lib/types";
import { AssetCard } from "./asset-card";

export function HomeSearch() {
  return (
    <form action="/free/" method="get" role="search" className="home-search">
      <div className="search-box">
        <MagnifyingGlass size={21} />
        <input
          type="search"
          name="query"
          aria-label="Search free assets"
          placeholder="Search free assets, formats, engines, or creators…"
        />
      </div>
      <button type="submit" className="button primary">
        Find assets
        <ArrowRight size={17} />
      </button>
      <Link className="home-search-filter" href="/free/">
        Browse with filters
        <ArrowRight size={16} />
      </Link>
    </form>
  );
}

export function FreeDiscoverySection({
  assets,
  latest = false,
}: {
  assets: Asset[];
  latest?: boolean;
}) {
  const Icon = latest ? Clock : Star;
  return (
    <section
      className="discovery-section"
      aria-labelledby={latest ? "recent-heading" : "featured-heading"}
    >
      <div className="discovery-heading">
        <div>
          <h2 id={latest ? "recent-heading" : "featured-heading"}>
            <Icon size={23} weight="duotone" />
            {latest ? "Recently Discovered" : "Featured Free Assets"}
          </h2>
          <p>
            {latest
              ? "The latest additions to your creative toolkit."
              : "Standout packs from the permanent free library."}
          </p>
        </div>
        <Link className="text-link" href={latest ? "/latest/" : "/free/"}>
          View all
          <ArrowRight size={17} />
        </Link>
      </div>
      <div className="asset-grid discovery-grid">
        {assets.slice(0, 3).map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  );
}

export function CategoryDiscovery() {
  return (
    <section className="category-discovery">
      <div className="discovery-heading">
        <div>
          <h2>
            <SquaresFour size={23} weight="duotone" />
            Explore by world
          </h2>
          <p>A shortcut to the pieces your next game needs.</p>
        </div>
      </div>
      <div className="category-tabs">
        {categories.map((category) => (
          <Link
            className="category-tab"
            key={category}
            href={`/category/${category.toLowerCase()}/`}
          >
            {category}
            <ArrowRight size={15} />
          </Link>
        ))}
      </div>
    </section>
  );
}
