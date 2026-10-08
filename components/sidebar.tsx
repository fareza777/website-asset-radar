"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour as SquaresFourIcon,
  Clock as ClockIcon,
  ShieldCheck as ShieldCheckIcon,
  Heart as HeartIcon,
  Stack as StackIcon,
  ArrowUpRight as ArrowUpRightIcon,
  Pause as PauseIcon,
  Play as PlayIcon,
  List as ListIcon,
  X as XIcon,
  CaretRight as CaretRightIcon,
  Sword as SwordIcon,
  Hourglass as HourglassIcon,
  Leaf as LeafIcon,
  GameController as GameControllerIcon,
  Layout as LayoutIcon,
  Waveform as WaveformIcon,
  Cube as CubeIcon,
  Fire as FireIcon,
  Tag as TagIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Brand } from "./brand";
import { useLibrary } from "./library-provider";
import { categories } from "@/lib/types";
import { useMotion } from "./motion-provider";

const categoryIcons = [
  SwordIcon,
  HourglassIcon,
  LeafIcon,
  GameControllerIcon,
  LayoutIcon,
  WaveformIcon,
  CubeIcon,
];

export function Sidebar({
  freeCount,
  collectionCount,
}: {
  freeCount: number;
  collectionCount: number;
}) {
  const path = usePathname();
  const { favorites } = useLibrary();
  const motion = useMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!mobileOpen) return;
    const drawer = drawerRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const background = [
      ...document.querySelectorAll<HTMLElement>(
        ".main-shell, .topbar, .skip-link",
      ),
    ];
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => {
      element.inert = true;
    });
    document.body.style.overflow = "hidden";
    const focusable = () =>
      [
        ...(drawer?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? []),
      ].filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 1050) setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => {
        element.inert = previousInert[index];
      });
      previousFocus?.focus();
    };
  }, [mobileOpen]);
  const discover = [
    {
      href: "/free/",
      label: "Free Assets",
      icon: SquaresFourIcon,
      index: "01",
      count: freeCount,
    },
    { href: "/free-today/", label: "Free Today", icon: FireIcon, index: "02" },
    { href: "/deals/", label: "Deals", icon: TagIcon, index: "03" },
    {
      href: "/collections/",
      label: "Collections",
      icon: StackIcon,
      index: "04",
    },
  ];
  const shortcuts = [
    { href: "/latest/", label: "Latest assets", icon: ClockIcon },
    { href: "/cc0/", label: "CC0 only", icon: ShieldCheckIcon },
  ];
  const library = [
    {
      href: "/favorites/",
      label: "Favorites",
      icon: HeartIcon,
      count: favorites.length,
    },
    ...shortcuts,
  ];
  const current =
    path.startsWith("/asset/") || path.startsWith("/assets/")
      ? "Asset details"
      : path.startsWith("/category/") || path.startsWith("/categories/")
        ? "Categories"
        : path.startsWith("/collections/")
          ? "Collections"
          : [...discover, ...library].find((x) => x.href === path)?.label ||
            "The library";
  const navItem = ({
    href,
    label,
    icon: Icon,
    count,
    index,
  }: {
    href: string;
    label: string;
    icon: typeof SquaresFourIcon;
    count?: number;
    index?: string;
  }) => (
    <Link
      key={href}
      href={href}
      className={`nav-link ${index ? "discover-link" : ""} ${path === href ? "active" : ""}`}
      data-nav={href.split("/")[1]}
      aria-current={path === href ? "page" : undefined}
      onClick={() => setMobileOpen(false)}
    >
      <span className="nav-icon">
        <Icon
          size={20}
          weight={path === href ? "duotone" : "regular"}
          aria-hidden="true"
        />
      </span>
      <span className="nav-text">{label}</span>
      {count !== undefined && <span className="nav-count">{count}</span>}
      {index && (
        <span className="nav-index" aria-hidden="true">
          {index}
        </span>
      )}
      {path === href && <span className="active-marker" aria-hidden="true" />}
    </Link>
  );
  return (
    <>
      {mobileOpen && (
        <button
          className="nav-backdrop"
          tabIndex={-1}
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        ref={drawerRef}
        onClickCapture={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest("a[href]")
          )
            setMobileOpen(false);
        }}
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? true : undefined}
        className={`sidebar motion-surface ${mobileOpen ? "mobile-open" : ""}`}
        data-motion="paused"
        aria-label="Main navigation"
      >
        <div className="sidebar-brand">
          <Brand />
          <button
            className="mobile-close icon-button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <XIcon size={21} />
          </button>
        </div>
        <Link
          href="/free/"
          className="sidebar-inventory"
          aria-label={`Explore ${freeCount} verified free assets`}
        >
          <span className="inventory-copy">
            <strong>{freeCount}</strong>
            <span>free discoveries</span>
          </span>
          <span className="sidebar-radar" aria-hidden="true">
            <span className="radar-ring" />
            <span className="radar-ring inner" />
            <span className="radar-sweep" />
            <span className="radar-blip one" />
            <span className="radar-blip two" />
            <span className="radar-crosshair" />
          </span>
        </Link>
        <div className="sidebar-section-label sidebar-discover-label">
          <span>Discover</span>
          <span className="section-coordinate" aria-hidden="true">
            ↗
          </span>
        </div>
        <nav className="discover-nav" aria-label="Discover assets">
          {discover.map(navItem)}
        </nav>
        <div className="sidebar-section-label library-label">YOUR LIBRARY</div>
        <nav aria-label="Your library">{library.map(navItem)}</nav>
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">EXPLORE BY WORLD</div>
        <nav className="category-nav" aria-label="Asset worlds">
          {categories.map((category, i) => {
            const Icon = categoryIcons[i];
            const href = `/category/${category.toLowerCase()}/`;
            return (
              <Link
                key={category}
                href={href}
                className={`nav-link category-link ${path === href ? "active" : ""}`}
                aria-current={path === href ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{category}</span>
                <CaretRightIcon
                  className="world-arrow"
                  size={13}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/about/" className="maker-note">
            <strong>Your next find awaits.</strong>
            <p>{collectionCount} curated collections.</p>
            <span className="maker-note-link">
              Meet AssetRadar <ArrowUpRightIcon size={15} />
            </span>
          </Link>
        </div>
      </aside>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <ListIcon size={22} />
          </button>
          <span className="breadcrumb-root">Discover</span>
          <CaretRightIcon size={12} />
          <span>{current}</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-caption">A good day to make something.</span>
          <button
            className="motion-toggle"
            onClick={motion.toggle}
            disabled={motion.state === "reduced"}
            aria-pressed={motion.state === "enabled"}
            aria-label={
              motion.state === "enabled"
                ? "Pause animations"
                : motion.state === "reduced"
                  ? "Animations reduced by your system preference"
                  : "Enable animations"
            }
            title={
              motion.state === "reduced"
                ? "Following your system’s reduced motion preference"
                : "Turn decorative animations on or off"
            }
          >
            {motion.state === "enabled" ? (
              <PauseIcon size={16} aria-hidden="true" />
            ) : (
              <PlayIcon size={16} aria-hidden="true" />
            )}
            <span>
              {motion.state === "enabled" ? "Motion on" : "Motion off"}
            </span>
          </button>
          <Link href="/licenses/" className="license-toplink">
            <ShieldCheckIcon size={17} />
            <span>License guide</span>
            <ArrowUpRightIcon size={13} />
          </Link>
        </div>
      </header>
    </>
  );
}
