import rules from "@/data/engine-formats.json";
import type { CardAsset } from "./catalog-card";

export type CompatibilityStatus = "Native" | "Importable" | "Unverified";
export type EngineCompatibility = { engine: string; status: CompatibilityStatus; formats: string[]; evidenceUrl: string; documentationUrl: string | null; note: string };
export const mainEngines = ["Unity", "Unreal", "Godot", "GameMaker"];

/** Package evidence takes priority. Publisher tags and a ZIP alone prove neither status. */
export function compatibilityFor(asset: CardAsset, engine: string): EngineCompatibility {
  const formats = asset.formats.map((format) => format.toUpperCase());
  const evidenceUrl = asset.type === "free" ? asset.verificationUrl : asset.canonicalSourceUrl;
  const native = engine === "Unreal" && formats.includes("UNREAL ENGINE") && asset.engines.includes("Unreal") ||
    engine === "Unity" && formats.includes("UNITYPACKAGE") && asset.engines.includes("Unity") ||
    engine === "Godot" && formats.includes("GODOT PROJECT") && asset.engines.includes("Godot");
  if (native) return { engine, status: "Native", formats: asset.formats, evidenceUrl, documentationUrl: null, note: `Publisher-listed ${engine} package. ${asset.engineNote} Native describes packaging, not a performance test.` };
  const kind = asset.dimension === "Audio" ? "audio" : asset.dimension === "3D" && asset.assetType !== "Textures" ? "model" : "image";
  const rule = asset.assetType === "Tools & Plugins" ? undefined : rules.find((item) => item.engine === engine && item.kind === kind && item.formats.some((format) => formats.includes(format)));
  if (rule) {
    const matched = rule.formats.filter((format) => formats.includes(format));
    return { engine, status: "Importable", formats: matched, evidenceUrl, documentationUrl: rule.documentationUrl, note: `${matched.join(" / ")} listed for this asset; supported by the engine's importer. Materials, sprites, animations and project setup may require work. No native integration or engine test is claimed.` };
  }
  return { engine, status: "Unverified", formats: [], evidenceUrl, documentationUrl: null, note: "No verified native package or documented supported content format for this engine. Publisher tags and archive extensions alone are insufficient evidence." };
}
export function assetCompatibility(asset: CardAsset) {
  return [...new Set([...mainEngines, ...asset.engines])].map((engine) => compatibilityFor(asset, engine));
}
