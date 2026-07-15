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
  content, consistent RFC 9457 errors, a security policy, and
  deployment/OAuth/incident guides. Preference writes use the same
  authenticated, same-origin, validated, and rate-limited API boundary.
- CI runs quality, tests, build, production HTTP smoke, and production audit for
  pull requests and direct pushes to `main`. A separate clean Supabase job
  applies migrations and runs all pgTAP/RLS tests.

## Last Action

Closed the remaining provider-independent verification and API-contract gaps.
Added behavior tests for pending player state, end-of-chapter and duration sleep
timers, multi-file advancement, versioned progress validation, exact Drive OAuth
scope/PKCE/token behavior, server-side Drive file validation, and bounded stream
retry after a rejected access token.

Added a dependency-free production smoke runner and made it part of `verify`
and CI. It starts the built app, checks health, public/legal/PWA resources,
manifest install metadata, security headers, and anonymous API protection, then
stops the process. The runner exposed inconsistent API error media types; every
versioned route now returns standard RFC 9457 fields with
`application/problem+json`, import endpoints handle malformed JSON explicitly,
and client error handling consumes the standard `detail` field.

## Verification

- `npm run verify`: formatting, ESLint, strict TypeScript, 64 tests in 25 files,
  the 28-route production build, and the production HTTP smoke check pass.
- `npm run test:coverage`: passed; current measured coverage is 71.31%
  statements, 58.8% branches, 67.21% functions, and 73.8% lines.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Repeatable production HTTP smoke: public/legal/PWA resources return `200`;
  protected APIs return RFC 9457 `401` responses anonymously; CSP, one-year
  HSTS, COOP, CORP, content-type, referrer, and permissions headers are present.
  The manifest and service worker are served successfully, with
  authenticated/Range/audio caching excluded by design.
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
- The in-app browser integration package is missing its required browser client.
  An earlier isolated headless Chrome session supplied exact desktop/mobile
  screenshots and DOM interaction evidence; repeatable Playwright journeys and
  physical-device accessibility/performance/install/offline-audio checks remain
  external.
- Unknown dynamic audiobook pages currently render noindex not-found UI with a
  streamed HTTP `200`; retain this known Next.js behavior unless a host-level
  hard `404` requirement is added.
- Browser codec support varies, especially for OGG and some audiobook formats;
  final capability behavior requires representative devices and files.
- `IMPLEMENTATION_PLAN.md` exceeds the generic 500-line guideline but remains a
  single cohesive planning artifact.

## Files Status

- Created: player/progress/Drive/OAuth/stream contract tests, the RFC 9457
  response helper and tests, the test-only server boundary, and the production
  HTTP smoke runner.
- Modified: all versioned API error paths and their client consumers, import JSON
  handling, Vitest server-module resolution, package scripts, CI, README,
  implementation plan, and this handoff.
- Currently being edited: none.
- Next work: external staging/provider/browser validation only, followed by fixes
  if those evidence-based checks find issues.
- Untouched: real credentials, remote branches, production services, and user
  Google Drive files.
