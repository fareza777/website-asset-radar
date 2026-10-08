import type { Metadata } from "next";
import { Stack } from "@phosphor-icons/react/dist/ssr";
import { CollectionsPreview } from "@/components/collections-preview";
import { PersonalCollections } from "@/components/personal-collections";
import { assets } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Game asset collections",
  description:
    "Discover curated collections of free game assets for cozy worlds, RPG dungeons, survival games, and game interfaces. Build your own personal collections.",
  alternates: { canonical: "/collections/" },
};
export default function Collections() {
  return (
    <>
      <div className="page-intro">
        <span className="page-intro-icon">
          <Stack size={27} weight="duotone" />
        </span>
        <h1>Great ideas come in pieces.</h1>
        <p>
          Explore assets that work well together, or collect the pieces for your
          own world.
        </p>
      </div>
      <CollectionsPreview all />
      <PersonalCollections assets={assets} />
    </>
  );
}
