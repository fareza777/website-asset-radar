"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlass as SearchIcon,
  SlidersHorizontal as SlidersIcon,
  SquaresFour as GridIcon,
  List as ListIcon,
  X as XIcon,
  CaretDown as CaretDownIcon,
  ArrowDown as ArrowDownIcon,
  Sword as SwordIcon,
  Hourglass as HourglassIcon,
  Leaf as LeafIcon,
  GameController as GameIcon,
  Layout as LayoutIcon,
  Waveform as AudioIcon,
  Cube as CubeIcon,
  Heart as HeartIcon,
  ArrowRight as ArrowRightIcon,
} from "@phosphor-icons/react";
import {
  categories,
  type DirectoryAsset,
  type Filters,
  type Promotion,
} from "@/lib/types";
import { useOfferClock } from "@/lib/use-offer-clock";
import { offerStatus } from "@/lib/offer-utils";
import { filterAssets } from "@/lib/catalog-utils";
import { useCatalogFilters } from "@/lib/use-catalog-filters";
import { useLibrary } from "./library-provider";
import { AssetCard } from "./asset-card";

const categoryIcons = [
  SwordIcon,
  HourglassIcon,
  LeafIcon,
  GameIcon,
  LayoutIcon,
  AudioIcon,
  CubeIcon,
];
function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={`filter-select ${value !== "All" ? "is-filtered" : ""}`}>
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="All">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <CaretDownIcon size={12} />
    </label>
  );
}

export function AssetGallery({
  assets,
  initialFilters = {},
  favoritesOnly = false,
  heading = "The asset library",
  showCategories = true,
  offerMode,
}: {
  assets: DirectoryAsset[];
  initialFilters?: Partial<Filters>;
  favoritesOnly?: boolean;
  heading?: string;
  showCategories?: boolean;
  offerMode?: Promotion["type"];
}) {
  const { favorites, ready } = useLibrary();
  const { filters, defaults, update } = useCatalogFilters(initialFilters);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [limit, setLimit] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const now = useOfferClock(
    offerMode
      ? assets.filter((asset): asset is Promotion => asset.type !== "free")
      : [],
  );
  const available = offerMode
    ? assets.filter(
        (asset) =>
          asset.type === offerMode &&
          (now === null || offerStatus(asset, now) === "active"),
      )
    : assets;
  const base = favoritesOnly
    ? available.filter((asset) => favorites.includes(asset.id))
    : available;
  const filtered = filterAssets(base, filters);
  const shown = filtered.slice(0, limit);
  const activeKeys = (Object.keys(filters) as (keyof Filters)[]).filter(
    (key) => key !== "sort" && filters[key] !== defaults[key],
  );
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (
        event.key === "Escape" &&
        filterPanelRef.current?.contains(document.activeElement)
      ) {
        setFiltersOpen(false);
        filterRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);
  if (favoritesOnly && base.length === 0)
    return (
      <section className="empty-state favorite-empty">
        <div className="empty-icon">
          <HeartIcon size={37} weight="duotone" />
        </div>
        <h2>
          {ready ? "Good finds deserve a home." : "Your personal library"}
        </h2>
        <p>
          Tap the heart on any asset to keep it here.
          <br />
          Your favorites stay in this browser, ready for your next idea.
        </p>
        <Link href="/" className="button primary">
          Find your first favorite <ArrowRightIcon size={18} />
        </Link>
      </section>
    );
  return (
    <section
      id="asset-library"
      className="gallery-section"
      aria-labelledby="gallery-heading"
    >
      {showCategories && (
        <div className="category-tabs" aria-label="Filter by genre">
          <button
            className={`category-tab ${filters.category === "All" ? "selected" : ""}`}
            aria-pressed={filters.category === "All"}
            onClick={() => update({ category: "All" })}
          >
            <GridIcon size={17} weight="duotone" /> All assets
          </button>
          {categories.map((category, i) => {
            const Icon = categoryIcons[i];
            return (
              <button
                key={category}
                className={`category-tab ${filters.category === category ? "selected" : ""}`}
                aria-pressed={filters.category === category}
                onClick={() => update({ category })}
              >
                <Icon size={17} />
                {category}
              </button>
            );
          })}
        </div>
      )}
      <div className="gallery-heading-row">
        <h2 id="gallery-heading">
          {heading}
          <span className="asset-count">{filtered.length}</span>
        </h2>
        <div className="gallery-tools">
          <label className="sort-select">
            <span className="sr-only">Sort assets</span>
            <select
              aria-label="Sort assets"
              value={filters.sort}
              onChange={(e) =>
                update({ sort: e.target.value as Filters["sort"] })
              }
            >
              <option value="curated">Curated</option>
              <option value="latest">Recently added</option>
              <option value="name">Name A to Z</option>
            </select>
            <CaretDownIcon size={12} />
          </label>
          <div className="gallery-view">
            <button
              className={`icon-button ${view === "grid" ? "selected" : ""}`}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <GridIcon size={19} />
            </button>
            <button
              className={`icon-button ${view === "list" ? "selected" : ""}`}
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <ListIcon size={19} />
            </button>
          </div>
        </div>
      </div>
      <div className="search-filter-row">
        <div className="search-box">
          <SearchIcon size={20} />
          <input
            ref={searchRef}
            aria-label="Search assets"
            type="search"
            placeholder="Search assets, creators, or styles..."
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
          />
          <kbd>Ctrl K</kbd>
        </div>
        <button
          ref={filterRef}
          className={`button filter-toggle ${filtersOpen || activeKeys.length ? "has-filters" : ""}`}
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersIcon size={19} />
          <span>Filters</span>
          {activeKeys.length > 0 && (
            <span className="filter-count">{activeKeys.length}</span>
          )}
        </button>
      </div>
      <div
        ref={filterPanelRef}
        id="catalog-filters"
        className={`filter-bar ${filtersOpen ? "expanded" : ""}`}
      >
        <div className="filter-options">
          <SelectFilter
            label="Dimension"
            value={filters.dimension}
            options={["2D", "3D", "Audio"]}
            onChange={(dimension) => update({ dimension })}
          />
          <SelectFilter
            label="Asset type"
            value={filters.assetType}
            options={[...new Set(assets.map((a) => a.assetType))]}
            onChange={(assetType) => update({ assetType })}
          />
          <SelectFilter
            label="Game engine"
            value={filters.engine}
            options={[...new Set(assets.flatMap((asset) => asset.engines))]}
            onChange={(engine) => update({ engine })}
          />
          <SelectFilter
            label="License"
            value={filters.license}
            options={[...new Set(assets.map((a) => a.license))]}
            onChange={(license) => update({ license })}
          />
          <SelectFilter
            label="Source"
            value={filters.source}
            options={[...new Set(assets.map((a) => a.source))]}
            onChange={(source) => update({ source })}
          />
        </div>
      </div>
      {activeKeys.length > 0 && (
        <div className="active-filters">
          {activeKeys.map((key) => (
            <button
              key={key}
              className="filter-chip"
              aria-label={`Clear ${key} filter`}
              onClick={() => update({ [key]: defaults[key] })}
            >
              {key === "query" ? `“${filters[key]}”` : filters[key]}
              <XIcon size={12} />
            </button>
          ))}
          <button className="text-button" onClick={() => update({}, true)}>
            Clear all
          </button>
        </div>
      )}
      <div className="gallery-status">
        <span role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "asset" : "assets"}
          {activeKeys.length
            ? " matching your search"
            : " to bring your ideas to life"}
        </span>
        <span className="verified-note">
          <span className="live-dot" /> Every license checked
        </span>
      </div>
      {filtered.length ? (
        <>
          <div
            className={`asset-grid ${offerMode ? "offer-grid" : ""} ${view === "list" ? "list-view" : ""}`}
          >
            {shown.map((asset, index) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                view={view}
                priority={index < 3}
              />
            ))}
          </div>
          {limit < filtered.length && (
            <div className="load-more">
              <button
                className="button secondary"
                onClick={() => setLimit(limit + 12)}
              >
                Show more assets <ArrowDownIcon size={16} />
              </button>
              <span>
                Showing {shown.length} of {filtered.length} assets
              </span>
            </div>
          )}
        </>
      ) : offerMode && now === null && assets.length ? (
        <div className="promotion-loading" role="status">
          Checking current offers…
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <SearchIcon size={35} />
          </div>
          <h3>
            {offerMode && !base.length
              ? "No verified offers right now."
              : "A little too specific?"}
          </h3>
          <p>
            {offerMode && !base.length
              ? "Offers appear after their current price and commercial license are verified. Explore the permanent free library while you wait."
              : "No assets match these filters. Try a different style or loosen a filter."}
          </p>
          {offerMode && !base.length ? (
            <Link className="button primary" href="/free/">
              Browse free assets
              <ArrowRightIcon size={17} />
            </Link>
          ) : (
            <button className="button primary" onClick={() => update({}, true)}>
              Reset filters <ArrowRightIcon size={17} />
            </button>
          )}
        </div>
      )}
      <p className="engine-filter-note">
        {offerMode
          ? "Prices shown in USD. ≈ marks a conversion estimate; checkout prices may vary by region or license tier. Purchase directly from the original creator."
          : "Engine filters match importable file formats. Asset setup may be required."}
      </p>
    </section>
  );
}
