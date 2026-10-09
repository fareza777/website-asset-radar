import Link from "next/link";
import { ArrowUpRight, Cube } from "@phosphor-icons/react/dist/ssr";
import { assetCompatibility } from "@/lib/engine-compatibility";
import type { DirectoryAsset } from "@/lib/types";

export function EngineChips({ asset, preferredEngine }: { asset: DirectoryAsset; preferredEngine?: string }) {
  const all = assetCompatibility(asset);
  const supported = all.filter((item) => item.status !== "Unverified").sort((a, b) => Number(b.engine === preferredEngine) - Number(a.engine === preferredEngine));
  const unverified = preferredEngine && preferredEngine !== "All" ? all.find((item) => item.engine === preferredEngine && item.status === "Unverified") : undefined;
  const label = supported.map((item) => `${item.engine}: ${item.status}`).join(" · ");
  return <div className="engine-chips" aria-label="Engine compatibility">
    {unverified && <Link className="engine-chip unverified" href={`/asset/${asset.id}/#compatibility`} title={unverified.note}>{unverified.engine}<span>Unverified</span></Link>}
    {supported.length ? <>
      {supported.slice(0, 2).map((item) => <Link className={`engine-chip ${item.status.toLowerCase()}`} key={item.engine} href={`/asset/${asset.id}/#compatibility`} title={item.note}>{item.engine}<span>{item.status}</span></Link>)}
      {supported.length > 2 && <Link className="engine-chip-more" href={`/asset/${asset.id}/#compatibility`} title={label} aria-label={`See all engine compatibility: ${label}`}>+{supported.length - 2}</Link>}
    </> : !unverified && <Link className="engine-chip unverified" href={`/asset/${asset.id}/#compatibility`} title={asset.engineNote}>Engine compatibility <span>Unverified</span></Link>}
  </div>;
}

export function EngineCompatibilityPanel({ asset }: { asset: DirectoryAsset }) {
  return <section className="engine-compatibility-panel" id="compatibility" aria-labelledby="compatibility-heading">
    <div className="compatibility-heading"><Cube size={23} weight="duotone" /><h2>Engine compatibility</h2></div>
    <p>Native describes publisher-listed engine packaging. Importable matches a documented file format. Neither is a claim of in-engine testing.</p>
    <div className="compatibility-rows">
      {assetCompatibility(asset).map((item) => <div className="compatibility-row" key={item.engine}>
        <div className="compatibility-engine"><strong>{item.engine}</strong><span className={`compatibility-status ${item.status.toLowerCase()}`}>{item.status}</span></div>
        <div><p>{item.note}</p><div className="compatibility-evidence-links"><a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer">Asset evidence <ArrowUpRight size={14} /></a>{item.documentationUrl && <a href={item.documentationUrl} target="_blank" rel="noopener noreferrer">Import documentation <ArrowUpRight size={14} /></a>}</div></div>
      </div>)}
    </div>
  </section>;
}
