import tintData from "../data/preview-tints.json";

// Average colour of each local preview, painted behind the image so cards never
// flash an empty box while loading. Refreshed by scripts/prepare-static.ts.
export const previewTints: Record<string, string> = tintData;

export const previewTint = (preview?: string | null) =>
  preview ? previewTints[preview] : undefined;
