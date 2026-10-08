# AssetRadar Implementation Plan

**Goal:** Ship the verified, static AssetRadar library to GitHub and Vercel.

**Architecture:** Static App Router pages read a typed JSON catalog. Small client components power browsing and browser-local saves. Maintenance runs outside the website and proposes changes through PRs.

**Tech Stack:** Next.js, TypeScript, React, Tailwind CSS, Phosphor icons, Zod.

**Spec:** ../specs/2026-10-08-assetradar-design.md

## Constraints

- No fabricated metadata, copied restricted media, login, or paid backend.
- Catalog entries require explicit source and license evidence.
- Keep output static and optimize licensed local preview images.
- Push to fareza777/website-asset-radar; deploy to Fareza's Vercel team.

## Review focus

- Combined and zero-result filters retain useful recovery controls.
- Corrupt or unavailable localStorage never breaks browsing.
- Duplicate canonical URLs and uncertain licenses fail catalog validation.
- Engine labels distinguish format support from publisher integrations.
- Future or unsupported verification dates cannot appear as verified.

## Execution

- [x] Establish typed catalog, source allowlist, and meaningful integrity tests.
- [x] Verify seed assets and create previews only from licensed asset content.
- [x] Build the responsive shell, original hero, filters, gallery, favorites, and collections.
- [x] Generate static asset/category/collection pages with metadata and structured data.
- [x] Prepare Cursor automation prompt, scripts, PR workflow, and operating documentation.
- [x] Verify lint, types, tests, source evidence, build, and browser behavior.
- [ ] Push the verified commit, deploy production, and inspect live pages.
