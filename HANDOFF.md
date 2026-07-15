# Quiet Library Handoff

## Project Overview

Quiet Library is a responsive, installable web audiobook player for people who
keep their own audio files in Google Drive. Next.js owns the application APIs,
Drive OAuth, imports, streaming, downloads, and synchronization. Supabase
provides Google identity, SSR sessions, managed Postgres, migrations, and RLS.
Source audio remains in Drive; explicit offline copies remain only on the
user's device.

## Current State

- Phase 0 is merged into `origin/main`. Local Phase 1-6 checkpoints are on
  `feat/phase-1-visual-shell` and have not been pushed.
- This personal repository permits direct pushes to `main` only when the user
  explicitly asks to push or sync directly. Force-pushing `main` is prohibited.
- Phase 1 provides the responsive warm-editorial landing and application
  shells for desktop and mobile, including all principal empty/loading/error
  states.
- Phase 2 provides Supabase SSR authentication, RLS migrations/tests, and a
  separate user-bound Drive OAuth flow with PKCE, exact scope validation,
  encrypted credentials, reconnect, and revoke-before-delete behavior.
- Phase 3 provides explicit-action Google Picker selection, server-side Drive
  validation, bounded ID3/chapter parsing, editable grouping, duplicate checks,
  transactional import, and real RLS-backed library reads.
- Phase 4 provides an authenticated owned-file Range proxy and one shared audio
  engine with seeking, chapters, multi-file continuation, rate, volume, Media
  Session, and sleep timers.
- Phase 5 provides atomic versioned progress, stale-write rejection, a bounded
  newest-per-book retry queue, completion, exact resume, and bookmarks.
- Phase 6 provides a typed manifest, code-native icons, install/update UX, a
  deliberately scoped service worker, branded offline fallback, authenticated
  full-file downloads, Dexie metadata, OPFS with Cache Storage fallback,
  storage/quota feedback, reconciliation, removal, and offline multi-file
  playback.
- The service worker does not cache auth routes, application HTML, API
  responses, Range traffic, or audio. Audio is stored only after an explicit
  user download.
- Next.js 15.5.20, React 19.1.0, TypeScript 5.9.3, Tailwind CSS 4.3.1, Zod
  4.4.3, Dexie 4.4.4, Supabase CLI 2.109.1, npm 11.6.1, and Node 24 are pinned.

## Last Action

Completed the Phase 6 implementation checkpoint. Added the PWA manifest,
icons, registration/install/update handling, offline fallback, safe cache
boundaries, authenticated full-source download streaming, device storage
backends and metadata, explicit download/cancel/remove/clear controls,
capacity/persistence feedback, partial and evicted-file cleanup, source-version
reconciliation, and object-URL-based offline playback through the shared audio
engine.

`npm run verify` passes with 25 Vitest/Testing Library tests and a 25-page
production build. `npm audit --omit=dev` reports zero vulnerabilities, and
`git diff --check` passes. Production HTTP smoke checks returned `200` for the
manifest, service worker, both offline routes, and both icons; the unauthenticated
download endpoint returned `401`; service-worker scope and no-cache headers are
correct. Development and production servers are stopped.

## In Progress

Phase 7 hardening and release readiness is next. Phase 6's automated and HTTP
checks pass, but installation and airplane-mode playback still need a supported
browser plus real imported Drive audio. Phase 1 visual approval and the Phase
2-5 live-provider exit gates also remain open because the environment has no
browser instance, Docker, hosted Supabase configuration, or Google credentials.

## Next Actions

1. Implement Phase 7 account deletion, security headers and same-origin
   protections, database-backed rate limiting, safe structured telemetry, and
   accurate privacy/retention documentation.
2. Add release/deployment, Google OAuth verification, and incident-operation
   documentation; audit accessibility, responsiveness, SEO, and performance.
3. With Supabase available, apply migrations, generate database types, run all
   pgTAP/RLS tests, and test two-session progress conflict behavior.
4. With Google clients configured, verify identity, Drive consent/revocation,
   Picker/import, real Range streaming, and full offline downloads end to end.
5. In a supported browser, approve desktop/mobile visuals and prove PWA install,
   update, eviction, and airplane-mode playback behavior.

## Known Issues and External Gates

- Docker is unavailable, and no hosted Supabase project or Google OAuth clients
  are configured. No credentials were invented or committed.
- The in-app browser has no available browser instance, so screenshot review and
  real service-worker/offline interaction tests cannot run here.
- Unknown dynamic audiobook routes currently render noindex not-found UI with a
  streamed HTTP `200`; revisit hard-404 behavior during Phase 7.
- Browser codec support varies, especially for OGG and some audiobook formats;
  final capability checks require representative devices and files.
- Hosting must be validated for long-lived streaming, bandwidth, concurrency,
  timeout, and egress behavior.
- `IMPLEMENTATION_PLAN.md` exceeds the generic 500-line guideline but remains a
  single cohesive planning artifact.

## Files Status

- Created: PWA manifest/icons/service worker, install manager, public offline
  page, device-library controls, offline database/storage/download modules, and
  authenticated full-file download route.
- Modified: layout/config, audiobook source mapping, shared player offline
  resolution, offline page, dependencies, README, implementation plan, and this
  handoff.
- Currently being edited: none.
- Planned next: Phase 7 security, privacy/account, operations, deployment, and
  audit files.
- Untouched: real credentials, remote branches, and user Drive files.
