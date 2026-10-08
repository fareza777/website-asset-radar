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
  GithubLogo as GithubLogoIcon,
  Sparkle as SparkleIcon,
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

const categoryIcons = [
  SwordIcon,
  HourglassIcon,
  LeafIcon,
  GameControllerIcon,
  LayoutIcon,
  WaveformIcon,
  CubeIcon,
];

export function Sidebar() {
  const path = usePathname();
  const { favorites } = useLibrary();
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
    { href: "/free/", label: "Free Assets", icon: SquaresFourIcon },
    { href: "/free-today/", label: "Free Today", icon: FireIcon },
    { href: "/deals/", label: "Deals", icon: TagIcon },
    { href: "/collections/", label: "Collections", icon: StackIcon },
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
  }: {
    href: string;
    label: string;
    icon: typeof SquaresFourIcon;
    count?: number;
  }) => (
    <Link
      key={href}
      href={href}
      className={`nav-link ${path === href ? "active" : ""}`}
      aria-current={path === href ? "page" : undefined}
      onClick={() => setMobileOpen(false)}
    >
      <Icon size={20} weight={path === href ? "fill" : "regular"} />
      <span>{label}</span>
      {count !== undefined && <span className="nav-count">{count}</span>}
      {path === href && <span className="active-marker" />}
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
        className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}
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
        <div className="sidebar-section-label">DISCOVER</div>
        <nav>{discover.map(navItem)}</nav>
        <div className="sidebar-section-label library-label">YOUR LIBRARY</div>
        <nav>{library.map(navItem)}</nav>
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">EXPLORE BY WORLD</div>
        <nav className="category-nav">
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
                <Icon size={18} />
                <span>{category}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/about/" className="maker-note">
            <span className="maker-note-icon">
              <SparkleIcon size={22} weight="duotone" />
            </span>
            <strong>Made for your next idea.</strong>
            <p>
              Good assets. Clear licenses.
              <br />A little creative head start.
            </p>
            <span className="maker-note-link">
              Meet AssetRadar <ArrowUpRightIcon size={15} />
            </span>
          </Link>
          <a
            className="sidebar-github"
            href="https://github.com/fareza777/website-asset-radar"
            target="_blank"
            rel="noreferrer"
          >
            <GithubLogoIcon size={18} /> Built in the open{" "}
            <ArrowUpRightIcon size={13} />
          </a>
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
