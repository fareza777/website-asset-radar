export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://website-asset-radar-xi.vercel.app"
).replace(/\/$/, "");
export const siteName = "AssetRadar";
export const siteDescription =
  "Discover free game development assets with verified licenses. Browse 2D art, 3D models, UI kits, audio, and textures for your next game.";

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
