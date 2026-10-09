import Link from "next/link";
import { publisherForAsset } from "@/lib/publishers";
import type { DirectoryAsset } from "@/lib/types";

export function PublisherCredit({ asset }: { asset: Pick<DirectoryAsset, "author"> }) {
  const publisher = publisherForAsset(asset);
  return publisher ? <Link className="publisher-credit-link" href={`/publisher/${publisher.id}/`}>{asset.author}</Link> : <span>{asset.author}</span>;
}
