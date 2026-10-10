"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlass, SlidersHorizontal, SquaresFour, List, X, CaretDown,
  ArrowDown, Heart, ArrowRight, LinkSimple, Check,
} from "@/lib/icons";
import { categories, type Filters, type Promotion } from "@/lib/types";
import type { CardAsset, CardPromotion, CatalogScope } from "@/lib/catalog-card";
import { catalogFacets, scopeCatalogAssets, GALLERY_PAGE_SIZE, type CatalogFacets } from "@/lib/catalog-discovery";
import { useCatalogIndex } from "@/lib/use-catalog-index";
import { useOfferClock } from "@/lib/use-offer-clock";
import { offerStatus } from "@/lib/offer-utils";
import { filterAssets } from "@/lib/catalog-utils";
import { filterLabels } from "@/lib/filter-url";
import { getPublisher } from "@/lib/publishers";
import { useCatalogFilters } from "@/lib/use-catalog-filters";
import { useLibrary } from "./library-provider";
import { AssetCard } from "./asset-card";
import { CatalogFilters } from "./catalog-filters";

export function AssetGallery({
  assets: initialAssets, initialFilters = {}, favoritesOnly = false,
  heading = "The asset library", showCategories = true, offerMode,
  catalogUrl, scope, initialCount, initialFacets,
}: {
  assets: CardAsset[]; initialFilters?: Partial<Filters>; favoritesOnly?: boolean;
  heading?: string; showCategories?: boolean; offerMode?: Promotion["type"];
  catalogUrl?: string; scope?: CatalogScope; initialCount?: number; initialFacets?: CatalogFacets;
}) {
  const catalog = useCatalogIndex(catalogUrl);
  const pending = Boolean(catalogUrl && !catalog.data);
  const assets = useMemo(() => catalog.data
    ? scopeCatalogAssets(catalog.data.assets, scope, catalog.data.archivedIds)
    : initialAssets, [catalog.data, scope, initialAssets]);
  const facets = useMemo(() => catalog.data || !initialFacets
    ? catalogFacets(assets) : initialFacets, [catalog.data, assets, initialFacets]);
  const { favorites, ready } = useLibrary();
  const { filters, defaults, update, search } = useCatalogFilters(initialFilters);
  const query = useDeferredValue(filters.query);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [limit, setLimit] = useState(GALLERY_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "manual">("idle");
  const [shareUrl, setShareUrl] = useState("");
  const currentShareState = shareUrl && new URL(shareUrl).search === search ? shareState : "idle";
  const searchRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const promotions = assets.filter((asset): asset is CardPromotion => asset.type !== "free");
  const now = useOfferClock(promotions);
  const available = assets.filter((asset) =>
    (!offerMode || asset.type === offerMode) &&
    (favoritesOnly || asset.type === "free" || now === null || offerStatus(asset, now) === "active"),
  );
  const base = favoritesOnly ? available.filter((asset) => favorites.includes(asset.id)) : available;
  const filtered = filterAssets(base, { ...filters, query });
  const resultCount = pending ? (initialCount ?? filtered.length) : filtered.length;
  const shown = filtered.slice(0, limit);
  const activeKeys = (Object.keys(filters) as (keyof Filters)[]).filter((key) =>
    key !== "sort" && filters[key] !== defaults[key],
  );
  const changeFilters = (patch: Partial<Filters>) => { update(patch); setLimit(GALLERY_PAGE_SIZE); setShareState("idle"); };
  const reset = () => { update({}, true); setLimit(GALLERY_PAGE_SIZE); setShareState("idle"); };
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (!filtersOpen) return;
    const dialog = dialogRef.current;
    const trigger = filterRef.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    const onResize = () => { if (window.innerWidth >= 1200) setFiltersOpen(false); };
    window.addEventListener("resize", onResize);
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      window.removeEventListener("resize", onResize);
      trigger?.focus();
    };
  }, [filtersOpen]);
  async function share() {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); setShareUrl(url); setShareState("copied"); }
    catch { setShareUrl(url); setShareState("manual"); }
  }
  function chipText(key: keyof Filters) {
    if (key === "query") return `“${filters[key]}”`;
    if (key === "type") return filters.type === "free" ? "Permanently free" : filters.type === "limited_free" ? "Free Today" : "Premium deals";
    if (key === "discount") return `${filters.discount}%+ off`;
    if (key === "publisher") return getPublisher(filters.publisher)?.name ?? filters.publisher;
    return filters[key];
  }
  if (favoritesOnly && base.length === 0 && (!pending || ready && !favorites.length)) return (
    <section className="empty-state favorite-empty">
      <div className="empty-icon"><Heart size={37} weight="duotone" /></div>
      <h2>{ready ? "Good finds deserve a home." : "Your personal library"}</h2>
      <p>Tap the heart on any asset to keep it here.<br />Your favorites stay in this browser, ready for your next idea.</p>
      <Link href="/explore/" className="button primary">Find your first favorite <ArrowRight size={18} /></Link>
    </section>
  );
  return (
    <section id="asset-library" className="gallery-section advanced-gallery" aria-labelledby="gallery-heading">
      {showCategories && <div className="category-tabs" aria-label="Filter by genre">
        <button className={`category-tab ${filters.category === "All" ? "selected" : ""}`} aria-pressed={filters.category === "All"} onClick={() => changeFilters({ category: "All" })}><SquaresFour size={17} /> All genres</button>
        {categories.map((category) => <button key={category} className={`category-tab ${filters.category === category ? "selected" : ""}`} aria-pressed={filters.category === category} onClick={() => changeFilters({ category })}>{category}</button>)}
      </div>}
      <div className="gallery-search-row">
        <div className="search-box">
          <MagnifyingGlass size={22} />
          <input ref={searchRef} aria-label="Search assets" type="search" placeholder="Search assets, publishers, engines, or formats…" value={filters.query} onChange={(event) => changeFilters({ query: event.target.value })} />
          {filters.query ? <button className="search-clear icon-button" aria-label="Clear search" onClick={() => changeFilters({ query: "" })}><X size={17} /></button> : <kbd>Ctrl K</kbd>}
        </div>
        <button ref={filterRef} className="button filter-toggle advanced-filter-toggle" aria-expanded={filtersOpen} aria-controls="mobile-catalog-filters" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={19} /> Filters {activeKeys.length > 0 && <span className="filter-count">{activeKeys.length}</span>}</button>
        <button className="button share-filter-button" onClick={share} aria-label="Copy search link">{currentShareState === "copied" ? <Check size={18} /> : <LinkSimple size={18} />}<span>{currentShareState === "copied" ? "Link copied" : "Share search"}</span></button>
      </div>
      {currentShareState === "manual" && <label className="share-url">Copy this search link<input readOnly value={shareUrl} aria-label="Search link" onFocus={(event) => event.currentTarget.select()} /></label>}
      <div className="catalog-layout">
        <aside className="catalog-filter-sidebar" aria-label="Advanced asset filters"><CatalogFilters facets={facets} filters={filters} update={changeFilters} reset={reset} /></aside>
        <div className="catalog-results">
          <div className="gallery-heading-row">
            <h2 id="gallery-heading">{heading}<span className="asset-count">{resultCount}</span></h2>
            <div className="gallery-tools">
              <label className="sort-select"><span className="sr-only">Sort assets</span><select aria-label="Sort assets" value={filters.sort} onChange={(event) => changeFilters({ sort: event.target.value as Filters["sort"] })}>
                <option value="curated">Curated picks</option><option value="latest">Recently added</option><option value="quality">Radar Score</option><option value="discount">Biggest discount</option><option value="deal">Deal Score</option><option value="name">Name A to Z</option>
              </select><CaretDown size={12} /></label>
              <div className="gallery-view">
                <button className={`icon-button ${view === "grid" ? "selected" : ""}`} aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><SquaresFour size={19} /></button>
                <button className={`icon-button ${view === "list" ? "selected" : ""}`} aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={19} /></button>
              </div>
            </div>
          </div>
          {activeKeys.length > 0 && <div className="active-filters">
            {activeKeys.map((key) => <button key={key} className="filter-chip" aria-label={`Clear ${filterLabels[key]} filter`} onClick={() => changeFilters({ [key]: defaults[key] })}>{chipText(key)}<X size={13} /></button>)}
            <button className="text-button" onClick={reset}>Clear all</button>
          </div>}
          <div className="gallery-status">
            <span role="status" aria-live="polite">{pending && activeKeys.length ? "Loading search results…" : `${resultCount} ${resultCount === 1 ? "asset" : "assets"}${activeKeys.length ? " matching your filters" : " on your radar"}`}</span>
            <span className="verified-note"><span className="live-dot" /> License evidence checked</span>
          </div>
          {catalog.error && <p role="status">The full catalog could not load. Your preview cards are still available. <button className="text-button" onClick={catalog.retry}>Try again</button></p>}
          {filtered.length ? <>
            <div className={`asset-grid ${view === "list" ? "list-view" : ""}`}>
              {shown.map((asset, index) => <AssetCard key={asset.id} asset={asset} view={view} priority={index < 3} preferredEngine={filters.engine} />)}
            </div>
            {limit < resultCount && <div className="load-more"><button className="button secondary" disabled={pending} onClick={() => setLimit(limit + GALLERY_PAGE_SIZE)}>{pending ? "Loading catalog…" : "Show more assets"} <ArrowDown size={16} /></button><span>Showing {shown.length} of {resultCount}</span></div>}
          </> : pending ? <div className="empty-state"><p role="status">{catalog.error ? "Use Try again to load the full catalog." : "Loading your discoveries…"}</p></div> : <div className="empty-state">
            <div className="empty-icon"><MagnifyingGlass size={35} /></div>
            <h3>{offerMode && !base.length ? "No verified offers right now." : "Nothing matches this combination."}</h3>
            <p>{offerMode && !base.length ? "New offers appear after their current price and commercial license are verified." : "Try a broader genre, another engine, or one fewer filter. Publisher coverage is growing through verified additions."}</p>
            <button className="button primary" onClick={reset}>Reset filters <ArrowRight size={17} /></button>
            <Link className="text-link empty-browse-link" href="/explore/">Explore all discoveries <ArrowRight size={16} /></Link>
          </div>}
          <p className="engine-filter-note">Native means publisher-listed engine files. Importable means a supported format, with setup required. Prices use USD; ≈ marks a dated conversion estimate.</p>
        </div>
      </div>
      {filtersOpen && <dialog ref={dialogRef} id="mobile-catalog-filters" className="catalog-filter-drawer" aria-labelledby="mobile-filter-title" onCancel={() => setFiltersOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setFiltersOpen(false); }}>
        <div className="filter-drawer-header"><h2 id="mobile-filter-title">Refine your radar</h2><button className="icon-button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={23} /></button></div>
        <CatalogFilters facets={facets} filters={filters} update={changeFilters} reset={reset} compact />
        <div className="filter-drawer-footer"><button className="text-button" onClick={reset}>Reset all</button><button className="button primary" onClick={() => setFiltersOpen(false)}>Show {resultCount} assets <ArrowRight size={17} /></button></div>
      </dialog>}
    </section>
  );
}
