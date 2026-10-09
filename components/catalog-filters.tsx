"use client";
import { CaretDown, SlidersHorizontal, ArrowCounterClockwise } from "@phosphor-icons/react";
import { categories, type DirectoryAsset, type Filters } from "@/lib/types";
import { mainEngines } from "@/lib/engine-compatibility";
import { publishers, publisherForAsset } from "@/lib/publishers";

type Option = { value: string; label: string };
const allLabels: Record<string, string> = {
  "Game engine": "All engines", Compatibility: "Any compatibility", "Asset type": "All asset types", Dimension: "All dimensions",
  Publisher: "All publishers", Genre: "All genres", License: "All licenses", "File format": "All file formats", "Marketplace / source": "All sources",
};
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return <label className={`catalog-filter-field ${value !== "All" ? "is-filtered" : ""}`}>
    <span>{label}</span>
    <span className="catalog-select-wrap">
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">{allLabels[label] ?? "Any"}</option>
        {value !== "All" && !options.some((option) => option.value === value) && <option value={value}>{value}</option>}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <CaretDown size={14} aria-hidden="true" />
    </span>
  </label>;
}
const availability = [
  { value: "All", label: "All discoveries" },
  { value: "free", label: "Permanently free" },
  { value: "limited_free", label: "Free Today · 100% off" },
  { value: "deal", label: "Premium deals" },
] as const;
const sorted = (values: string[]) => [...new Set(values)].sort().map((value) => ({ value, label: value }));

export function CatalogFilters({ assets, filters, update, reset, compact = false }: { assets: DirectoryAsset[]; filters: Filters; update: (patch: Partial<Filters>) => void; reset: () => void; compact?: boolean }) {
  const authors = [...new Set(assets.filter((asset) => !publisherForAsset(asset)).map((asset) => asset.author))];
  const publisherOptions = [...publishers.map((publisher) => ({ value: publisher.id, label: publisher.name })), ...authors.map((name) => ({ value: name, label: name }))];
  const kinds = new Set(assets.map((asset) => asset.type));
  return <div className="catalog-filter-content">
    {!compact && <div className="catalog-filter-heading"><span><SlidersHorizontal size={19} /> Refine your radar</span><button onClick={reset} className="icon-button" aria-label="Reset all filters" title="Reset all filters"><ArrowCounterClockwise size={18} /></button></div>}
    {kinds.size > 1 && <fieldset className="availability-filters">
      <legend>Availability</legend>
      {availability.map((option) => <label key={option.value}>
        <input type="radio" name={compact ? "drawer-availability" : "availability"} value={option.value} checked={filters.type === option.value} onChange={() => update({ type: option.value })} />
        <span>{option.label}</span>
      </label>)}
    </fieldset>}
    <SelectField label="Game engine" value={filters.engine} options={sorted([...mainEngines, ...assets.flatMap((asset) => asset.engines)])} onChange={(engine) => update({ engine })} />
    <SelectField label="Compatibility" value={filters.compatibility} options={sorted(["Native", "Importable", "Unverified"])} onChange={(compatibility) => update({ compatibility: compatibility as Filters["compatibility"] })} />
    <p className="filter-evidence-hint">{filters.compatibility === "Unverified" && filters.engine === "All" ? "No engine compatibility established. Select an engine to check it individually." : "Native package, supported file format, or still unverified."}</p>
    {assets.some((asset) => asset.type !== "free") && <fieldset className="discount-filters">
      <legend>Minimum discount</legend>
      <div>{(["All", "30", "50", "70"] as const).map((discount) => <button key={discount} onClick={() => update({ discount })} aria-pressed={filters.discount === discount} className={filters.discount === discount ? "selected" : ""}>{discount === "All" ? "Any" : `${discount}%+`}</button>)}</div>
    </fieldset>}
    <SelectField label="Asset type" value={filters.assetType} options={sorted(assets.map((asset) => asset.assetType))} onChange={(assetType) => update({ assetType })} />
    <SelectField label="Dimension" value={filters.dimension} options={sorted(["2D", "3D", "Audio"])} onChange={(dimension) => update({ dimension })} />
    <SelectField label="Publisher" value={filters.publisher} options={publisherOptions} onChange={(publisher) => update({ publisher })} />
    <SelectField label="Genre" value={filters.category} options={sorted([...categories])} onChange={(category) => update({ category })} />
    <SelectField label="License" value={filters.license} options={sorted(assets.map((asset) => asset.license))} onChange={(license) => update({ license })} />
    <SelectField label="File format" value={filters.format} options={sorted(assets.flatMap((asset) => asset.formats))} onChange={(format) => update({ format })} />
    <SelectField label="Marketplace / source" value={filters.source} options={sorted(assets.map((asset) => asset.source))} onChange={(source) => update({ source })} />
    <p className="filter-evidence-hint">Filters combine. Only verified price reductions appear as deals.</p>
  </div>;
}
