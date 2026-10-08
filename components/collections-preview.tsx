import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight as ArrowIcon,
  ArrowRight as ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { collections, getAsset } from "@/lib/catalog";

export function CollectionsPreview({ all = false }: { all?: boolean }) {
  return (
    <section className="collections-section">
      <div className="collections-heading">
        <div>
          <h2>{all ? "Curated collections" : "A few good starting points."}</h2>
          <p>Thoughtful combinations for the worlds you want to build.</p>
        </div>
        {!all && (
          <Link href="/collections/" className="text-link">
            All collections <ArrowRightIcon size={16} />
          </Link>
        )}
      </div>
      <div className={`collection-grid ${all ? "all-collections" : ""}`}>
        {(all ? collections : collections.slice(0, 2)).map((collection) => {
          const cover = getAsset(collection.cover);
          return (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}/`}
              className={`collection-card ${collection.color}`}
            >
              <div className="collection-art">
                {cover && (
                  <Image
                    src={cover.preview}
                    alt=""
                    width={400}
                    height={225}
                    sizes="(max-width: 700px) 90vw, 25vw"
                  />
                )}
              </div>
              <div className="collection-copy">
                <span className="collection-meta">
                  CURATED COLLECTION · {collection.assetIds.length} ASSETS
                </span>
                <h3>{collection.name}</h3>
                <p>{collection.description}</p>
                <span className="collection-link">
                  Explore collection <ArrowIcon size={15} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
