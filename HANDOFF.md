# Quiet Library Handoff

## Project Overview

Quiet Library is a responsive, installable web audiobook player for people who
keep their own audio files in Google Drive. Next.js owns the application APIs,
Drive OAuth, imports, Range streaming, offline downloads, and synchronization.
Supabase provides Google identity, SSR sessions, managed Postgres, migrations,
and RLS. Source audio stays in Drive; explicit offline copies stay only in the
user's browser profile.

## Current State

- The planned local implementation for Phases 0-7 is complete. Phase 0 is on
  `origin/main`; the later local checkpoint commits are on
  `feat/phase-1-visual-shell` and have not been pushed.
- Direct pushes to `main` are permitted only when the user explicitly asks to
  push or sync directly. Force-pushing `main` is prohibited.
- Phase 1 provides the responsive warm-editorial landing and application UI for
  desktop and mobile, including principal empty/loading/error states, live
  library search/filters, mobile account navigation, editable book details,
  account-backed preferences, theme selection, and keyboard/reduced-motion
  accessibility behavior.
- Phase 2 provides Supabase SSR authentication, normalized/RLS-protected data,
  and a separate user-bound Drive OAuth flow with PKCE, exact scopes, encrypted
  credentials, reconnect, and revoke-before-delete.
- Phase 3 provides explicit Google Picker selection, server-side Drive
  validation, bounded ID3/chapter parsing, editable grouping, duplicate checks,
  transactional import, and real library reads.
- Phase 4 provides an authenticated owned-file Range proxy and one shared audio
  engine with seeking, chapters, multi-file continuation, rate, volume, Media
  Session, and sleep timers.
- Phase 5 provides atomic versioned progress, stale-write rejection, a bounded
  newest-per-book retry queue, exact resume, completion, and bookmarks.
- Phase 6 provides the manifest/install/update flow, deliberately scoped service
  worker, offline fallback, authenticated downloads, Dexie metadata, OPFS with
  Cache Storage fallback, storage feedback, reconciliation, and offline
  multi-file playback.
- Phase 7 provides cursor-paginated library/detail/correction APIs, account
  deletion with Drive revocation and Auth/database cascade, same-origin mutation
  checks, private atomic Postgres quotas, CSP/HSTS/cross-origin headers,
  allowlisted JSON events, redaction and accessibility tests, expanded legal
  content, a security policy, and deployment/OAuth/incident guides. Preference
  writes use the same authenticated, same-origin, validated, and rate-limited
  API boundary.
- CI runs quality, tests, build, and production audit for pull requests and
  direct pushes to `main`. A separate clean Supabase job applies migrations and
  runs all pgTAP/RLS tests.

## Last Action

Completed the local usability, accessibility, and responsive-browser closure
pass. The library now searches title/author/narrator and filters all,
in-progress, device-downloaded, and finished books. Mobile account navigation
exposes Settings and Sign out. Settings persist validated playback rate, skip
intervals, default sleep timer, and theme through a protected preference API;
the player and Media Session consume those defaults. Owned book details can be
corrected through the existing bounded metadata API.

Fixed the skip link so it is visually hidden until focused, gave settings and
offline pages proper level-one headings, and added system/dark theme plus global
reduced-motion behavior. The exact 390x844 and 1440x900 Chrome DevTools audit
covered landing, application, library, book, offline, settings, onboarding,
import, legal, and offline-fallback routes with no horizontal overflow. Search,
finished filtering, the mobile account menu, theme switching, and skip-link
focus were exercised in the rendered production app.

## Verification

- Formatting, ESLint, strict TypeScript, 45 tests in 18 files, and the 28-route
  production build pass.
- `npm run test:coverage`: passed; current measured coverage is 65.23%
  statements, 54.11% branches, 61.58% functions, and 67.61% lines.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Production HTTP smoke: public/legal/PWA resources return `200`; protected new
  APIs return `401` anonymously; CSP, one-year HSTS, COOP, CORP, content-type,
  referrer, and permissions headers are present. The manifest and service worker
  are served successfully, with authenticated/Range/audio caching excluded by
  design.
- Repository audit: `git diff --check` passes, no TS/TSX file exceeds 200 lines,
  and no API-key, private-key, or JWT-shaped secret was found.
- Development and production servers are stopped.

## External Release Gates

Local implementation is complete, but release is not approved until the
following checks run against real infrastructure:

1. Select a Node streaming host, canonical domain, Supabase plan/region, log
   retention, and backup retention.
2. Apply migrations to staging, generate database types, run all pgTAP/RLS
   tests, and test rollback/recovery. Docker is unavailable locally, so only the
   configured CI/staging job can currently execute these checks.
3. Configure Supabase Google identity plus Drive OAuth/Picker clients and verify
   sign-in, restoration, sign-out, consent, import, reconnect, revocation, and
   account deletion with disposable data.
4. Validate large-file Range streaming, full downloads, host concurrency,
   timeout, bandwidth, and egress behavior.
5. Use two authenticated sessions to prove stale-write rejection, progress
   restoration, and bookmark isolation.
6. Reconfirm the passing local visuals on representative physical devices and
   prove PWA install, update, partial cleanup, quota failure, eviction, source
   changes, and airplane-mode multi-file playback.

Follow `docs/DEPLOYMENT.md` for the release order,
`docs/GOOGLE_OAUTH_VERIFICATION.md` for Google setup/evidence, and
`docs/OPERATIONS.md` for monitoring and incidents.

## Known Constraints

- No Docker, hosted Supabase project, Google OAuth clients, production domain,
  or deploy target are configured. No credentials were invented or committed.
- The in-app browser integration has no available instance. An isolated
  headless Chrome session supplied exact desktop/mobile screenshots and DOM
  interaction evidence instead; physical-device accessibility/performance and
  install/offline-audio checks remain external.
- Unknown dynamic audiobook pages currently render noindex not-found UI with a
  streamed HTTP `200`; retain this known Next.js behavior unless a host-level
  hard `404` requirement is added.
- Browser codec support varies, especially for OGG and some audiobook formats;
  final capability behavior requires representative devices and files.
- `IMPLEMENTATION_PLAN.md` exceeds the generic 500-line guideline but remains a
  single cohesive planning artifact.

## Files Status

- Created: interactive library browser; mobile account menu; metadata editor;
  preference contracts, repository, API, UI, and tests; extracted player audio
  source hook; preference pgTAP coverage.
- Modified: application layout/shell, library/detail/offline/settings routes,
  player controls and defaults, design tokens, rate-limit migration/tests,
  README, implementation plan, and this handoff.
- Currently being edited: none.
- Next work: external staging/provider/browser validation only, followed by fixes
  if those evidence-based checks find issues.
- Untouched: real credentials, remote branches, production services, and user
  Google Drive files.
