# Quiet Library Handoff

## Project Overview

Quiet Library is a responsive web audiobook player and installable PWA for people who keep their own audiobook files in Google Drive. Users will authenticate with Google, explicitly select their own audiobook files, and stream or download them while Quiet Library synchronizes metadata, progress, bookmarks, and preferences.

The approved technical direction is a hybrid backend: Next.js owns application APIs, Drive OAuth, import, Range streaming, and synchronization; Supabase provides Google identity, SSR sessions, managed Postgres, SQL migrations/types, and RLS. The approved visual direction is a warm editorial desktop/mobile interface.

## Current State

- Phase 0 is merged into `origin/main`. Active work is on local branch `feat/phase-1-visual-shell`; nothing from Phase 1 has been pushed.
- This personal repository permits a normal direct push to `main` when the user explicitly asks to push or sync directly; pull requests remain the default for ambiguous requests, and force-pushing `main` remains prohibited.
- Next.js 15.5.20, React 19.1.0, TypeScript 5.9.3, Tailwind CSS 4.3.1, Zod 4.4.3, and the Supabase CLI 2.109.1 are pinned with npm 11.6.1 and Node 24.
- The Phase 1 responsive visual shell is implemented: landing, privacy, terms, auth error, application home, onboarding, library and collection states, audiobook detail, expanded player, offline management, settings, loading, error, and not-found surfaces.
- Desktop uses persistent left navigation and a bottom player; mobile uses a compact header, mini-player, and bottom navigation. All content uses mock data with no backend dependency.
- Strict TypeScript, ESLint, Prettier with Tailwind ordering, environment validation, security headers, design tokens, and a pull-request CI workflow are configured.
- The local Supabase CLI layout exists and is intentionally not linked to a remote project.
- Formatting, lint, strict typecheck, production build, production route smoke checks, expected unknown-book `404`, and production dependency audit pass. The build generates 21 pages and reports zero production vulnerabilities.
- No authentication, database migrations, Google integration, functional audio playback, persistence, tests, or PWA service worker has been implemented.
- Phase 1 visual approval remains pending because the in-app browser was unavailable for desktop/mobile screenshots in this session.

## Last Action

Reconciled local Git with merged `origin/main`, created `feat/phase-1-visual-shell`, and carried the project-specific Git policy checkpoint forward. Implemented the complete Phase 1 visual surface using the existing dependency set: expanded Tailwind design tokens and `next/font` typography, reusable application/marketing/library/player/state primitives, realistic mock audiobook data, every planned public and application route, responsive navigation/player chrome, accessibility semantics, and SEO routes. Updated `README.md` to reflect the new route and feature status.

Ran `npm run verify`, live development and production route smoke checks, an expected unknown-audiobook `404` check, file-size checks, `git diff --check`, and `npm audit --omit=dev --audit-level=high`. The in-app browser could not be selected because no browser instance was available, so visual screenshot verification was not claimed.

## In Progress

Phase 1 is implemented and its automated/runtime gates pass. Desktop/mobile visual review is still required before the Phase 1 exit gate can be marked fully approved. Development and production servers are stopped.

## Pending

1. Capture and review desktop/mobile screenshots when the in-app browser becomes available; correct any visual issues before closing the Phase 1 exit gate.
2. Begin Phase 2 database/authentication work after loading the Supabase, auth, security, API-data, and testing rules.
3. Install Docker Desktop or a compatible runtime before local Supabase migration/RLS verification; Docker remains unavailable on this machine.
4. Configure Google identity and remote Supabase credentials without committing secrets when external project values are available.
5. Add the planned test toolchain and tests with the features they verify, following `IMPLEMENTATION_PLAN.md`.

## Known Issues

- Docker is not installed, so `supabase start` and local database/auth container verification cannot run yet. `supabase init` and CLI 2.109.1 were verified.
- The in-app browser reported no available browser instances, so Phase 1 desktop/mobile visual fidelity and interaction screenshots are not yet verified. Code-level responsive and accessibility rules were applied and automated gates pass.
- The settings, filters, onboarding authorization, and player controls are intentionally visual/mock interactions in Phase 1; their functional behavior belongs to later phases.
- OGG and some audiobook codecs are not uniformly supported across browsers; runtime capability detection remains required.
- Final hosting must be validated for long-lived Range streaming, bandwidth, concurrency, and egress cost.
- `IMPLEMENTATION_PLAN.md` is over the generic 500-line guideline after Markdown formatting; it remains one cohesive planning responsibility and was not split during Phase 0.

## Files Status

- Created: Phase 0 foundation files plus `src/types/audiobook.ts`, `src/lib/mock/library.ts`, shared components under `src/components/{application,brand,library,marketing,player,settings,states,ui}/`, public routes under `src/app/(marketing)/{privacy,terms,auth/error}/`, application routes under `src/app/(application)/app/{library,onboarding,offline,settings,audiobooks/[audiobookId]}/`, application `loading.tsx` and `error.tsx`, root `not-found.tsx`, `robots.ts`, and `sitemap.ts`
- Modified: `src/app/globals.css` (semantic light/dark design tokens), `src/app/layout.tsx` (editorial/interface fonts), marketing and application layouts/pages (production visual shells), `README.md` (Phase 1 status and routes), `HANDOFF.md` (this checkpoint), and local ignored agent rules (direct-`main` policy)
- Currently Being Edited: none
- Planned to Edit: Phase 1 UI only if visual review finds issues; otherwise Phase 2 Supabase clients, migrations, auth routes/actions, middleware/session handling, environment schema, tests, README, and handoff
- Untouched: package dependency versions, Supabase schema/migrations, Google credentials/integration, streaming APIs, service worker, and remote Git branches
