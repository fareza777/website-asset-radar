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
import { assets as catalogAssets } from "@/lib/catalog";

export function HomeSearch() {
  return (
    <div className="home-search-area"><form action="/explore/" method="get" role="search" className="home-search">
      <div className="search-box">
        <MagnifyingGlass size={21} />
        <input
          type="search"
          name="query"
          aria-label="Search all game assets"
          placeholder="What will you build? Search assets, engines, or publishers…"
        />
      </div>
      <button type="submit" className="button primary">
        Find assets
        <ArrowRight size={17} />
      </button>
    </form><div className="home-search-shortcuts"><span>Start with</span><Link href="/explore/?engine=Unity">Unity</Link><Link href="/explore/?engine=Unreal">Unreal</Link><Link href="/explore/?engine=Godot">Godot</Link><Link href="/explore/?dimension=2D">2D art</Link><Link href="/explore/?assetType=Music">Music</Link><Link href="/explore/?discount=70">70%+ off</Link><Link className="home-search-filter" href="/explore/">Advanced filters <ArrowRight size={15} /></Link></div></div>
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
            {latest ? "Recently Discovered" : "Free Assets"}
          </h2>
          <p>
            {latest
              ? "The latest additions to your creative toolkit."
              : "Featured finds. Permanently free, with clear commercial licenses."}
          </p>
        </div>
        <Link className="text-link" href={latest ? "/latest/" : "/free/"}>
          View all
          <ArrowRight size={17} />
        </Link>
      </div>
      <div className="asset-grid discovery-grid free-discovery-grid">
        {assets.slice(0, 4).map((asset) => (
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
            aria-label={`Browse ${catalogAssets.filter((asset) => asset.categories.includes(category)).length} ${category} free assets`}
          >
            {category}
            <span className="category-result-count">
              {
                catalogAssets.filter((asset) =>
                  asset.categories.includes(category),
                ).length
              }
            </span>
            <ArrowRight size={15} />
          </Link>
        ))}
      </div>
    </section>
  );
}
