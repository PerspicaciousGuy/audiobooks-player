# Quiet Library Handoff

## Project Overview

Quiet Library is a responsive, installable web audiobook player for people who
keep their own audio files in Google Drive. Next.js owns the application APIs,
Drive OAuth, imports, Range streaming, offline downloads, and synchronization.
Supabase provides Google identity, SSR sessions, managed Postgres, migrations,
and RLS. Source audio stays in Drive; explicit offline copies stay only in the
user's browser profile.

## Current State

- The planned implementation for Phases 0-7 is complete and synchronized to
  `origin/main`.
- Direct pushes to `main` are permitted only when the user explicitly asks to
  push or sync directly. Force-pushing `main` is prohibited.
- A Koyeb Free web service in Frankfurt and a hosted Supabase project are
  configured. Real credentials live only in ignored local environment files
  and provider secret managers.
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

Linked the repository to the hosted Supabase project and applied the four
reviewed migrations after an exact dry run. Verified matching local/remote
migration history, all nine application tables with RLS enabled, zero persisted
test users, expected rate-limit privileges, and clean remote schema linting.

The linked pgTAP wrapper could not run because Docker Desktop is unavailable.
Executing the SQL files through the hosted query path passed the initial schema,
import transaction, progress conflict, and user preferences checks. The
rate-limit test has an existing pgTAP type error: it wraps `has_table(...)`
inside `ok(...)`. An in-memory corrected execution completed without a SQL
error, and independent hosted queries verified its table and privilege checks;
the tracked test file was not modified.

## In Progress

None. The hosted schema deployment and verification pass is complete.

## Pending

- Configure Supabase Google identity, the separate Google Drive OAuth client,
  and Google Picker.
- Correct the rate-limit pgTAP assertion after explicit approval, then run the
  unmodified linked database suite through Docker or CI.
- Decide whether to remediate the advisor findings with a new reviewed
  migration.

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
- Hosted Supabase migration history matches all four local migrations. Remote
  lint reports no schema errors, every application table has RLS enabled, and
  the database contains no persisted fixture users from verification.

## External Release Gates

Local implementation is complete, but release is not approved until the
following checks run against real infrastructure:

1. Confirm the current Koyeb Free/Supabase projects are staging or production,
   then choose production log retention and backup retention.
2. Fix the tracked rate-limit pgTAP assertion, run the unmodified linked database
   suite through Docker or CI, generate database types, and test
   rollback/recovery. The four migrations are already applied to the currently
   linked hosted project.
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

## Known Issues

- Docker Desktop is unavailable, so `supabase test db --linked` cannot run
  locally. Hosted SQL execution provides partial coverage but does not replace
  a clean CI pgTAP run.
- `supabase/tests/database/request_rate_limits.test.sql` incorrectly wraps the
  text-returning `has_table(...)` assertion in boolean `ok(...)` and fails until
  that tracked test is corrected.
- Supabase advisors warn that project-default `public.rls_auto_enable()` is
  executable by `anon` and `authenticated`. The authenticated warning for
  `public.consume_request_quota(text)` is intentional and covered by the access
  model. Neither grant was changed in this deployment task.
- Advisor review found missing indexes on nullable foreign-key columns:
  `bookmarks.audiobook_file_id`, `bookmarks.chapter_id`,
  `chapters.audiobook_file_id`, `playback_progress.audiobook_file_id`, and
  `playback_progress.chapter_id`.
- Google OAuth clients are not configured yet. No credentials were invented or
  committed.
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

- Created: ignored Supabase CLI linkage metadata under `supabase/.temp/`; no
  tracked source files were created.
- Modified: this handoff only. Hosted Supabase migration history and schema were
  updated by the four existing tracked migrations.
- Currently Being Edited: none.
- Planned to Edit: the rate-limit pgTAP assertion only after explicit approval;
  any index or function-grant remediation requires a new reviewed migration.
- Untouched: application source, existing migrations, `.env`, `.env.example`,
  Google OAuth configuration, remote Git history, and user Google Drive files.
