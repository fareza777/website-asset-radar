import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { AssetGallery } from "@/components/asset-gallery";
import { assets } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Free CC0 game assets",
  description:
    "Browse verified public-domain game assets. CC0 assets allow commercial use and modification without requiring attribution.",
  alternates: { canonical: "/cc0/" },
};
export default function CC0() {
  return (
    <>
      <div className="page-intro">
        <span className="page-intro-icon">
          <ShieldCheck size={27} weight="duotone" />
        </span>
        <h1>Creative freedom, included.</h1>
        <p>
          Public-domain assets for personal and commercial projects. No
          attribution required.
        </p>
        <Link className="text-link" href="/licenses/">
          Understand CC0 <ArrowUpRight size={15} />
        </Link>
      </div>
      <AssetGallery
        assets={assets.filter((a) => a.license === "CC0")}
        initialFilters={{ license: "CC0" }}
        heading="CC0 assets"
      />
    </>
  );
}
