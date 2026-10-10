"use client";
import { Heart } from "@/lib/icons";
import { useLibrary } from "./library-provider";

export function FavoriteButton({
  asset,
  large = false,
}: {
  asset: { id: string; title: string };
  large?: boolean;
}) {
  const { favorites, toggleFavorite, notify } = useLibrary();
  const saved = favorites.includes(asset.id);
  return (
    <button
      type="button"
      className={`${large ? "button secondary save-large" : "favorite-button"} ${saved ? "saved" : ""}`}
      aria-label={`${saved ? "Remove" : "Save"} ${asset.title} ${saved ? "from" : "to"} favorites`}
      aria-pressed={saved}
      onClick={() => {
        const added = toggleFavorite(asset.id);
        notify(added ? "Saved to your favorites" : "Removed from favorites");
      }}
    >
      <Heart size={large ? 20 : 19} weight={saved ? "fill" : "regular"} />
      {large && <span>{saved ? "Saved to favorites" : "Save asset"}</span>}
    </button>
  );
}
