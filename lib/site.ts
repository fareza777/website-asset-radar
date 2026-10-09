export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gameassetradar.top"
).replace(/\/$/, "");
export const siteName = "Game Asset Radar";
export const siteDescription =
  "Discover curated free game assets, limited-time freebies, and worthwhile premium deals. Explore 2D, 3D, UI and audio with verified prices and licenses.";

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
