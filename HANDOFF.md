# Quiet Library Handoff

## Project Overview

Quiet Library is a responsive, installable web audiobook player for people who
keep their own audio files in Google Drive. Next.js owns the application APIs,
Drive OAuth, imports, Range streaming, offline downloads, and synchronization.
Supabase provides Google identity, SSR sessions, managed Postgres, migrations,
and RLS. Source audio stays in Drive; explicit offline copies stay only in the
user's browser profile.

## Current State

- The planned implementation for Phases 0-7 is complete. Release-verification
  fixes are on `main`, and both GitHub Actions jobs pass.
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
  applies migrations, runs all pgTAP/RLS tests, and exercises rollback followed
  by migration recovery on its disposable database.

## Last Action

Traced the production Google sign-in action end to end. The deployed action now
returns Supabase authorization with
`https://greasy-bethanne-ebooks-0926d76e.koyeb.app/auth/callback` and preserves
`next=/app`; it contains no localhost redirect. The earlier localhost failure
therefore came from a stale or locally initiated OAuth attempt.

Fixed the CI installer mismatch by pinning both GitHub jobs to the repository's
declared npm `11.6.1`. Corrected the rate-limit pgTAP signature and made the
initial-schema fixture counts independent of real hosted users. Added and
applied migration `20260716062426_restrict_rls_auto_enable_execution`, which
keeps the `ensure_rls` event trigger intact while removing direct anonymous and
authenticated RPC execution of its SECURITY DEFINER function. The migration is
conditional because this hosted-project helper is absent from clean local
Supabase stacks.

Added `scripts/database-recovery.mjs` and its CI command. It verifies that every
migration has exactly one rollback, applies the rollback set in reverse order,
proves the application relations were removed, resets to the forward migration
set, and reruns the pgTAP/RLS suite. The local application verification passes;
the destructive database portion awaits its disposable GitHub runner.

## In Progress

Interactive hosted browser and physical-device release evidence remains. All
repository, build, hosted database, and clean CI database checks are complete.

## Pending

- Complete the real hosted Google sign-in, Drive consent/import, playback,
  progress, bookmark, reconnect/revoke, account-deletion, PWA, and physical
  device evidence flows.

## Verification

- `npm run verify`: formatting, ESLint, strict TypeScript, 64 tests in 25 files,
  the 28-route production build, and the production HTTP smoke check pass.
- All five pgTAP files pass through the linked hosted query path. The
  initial-schema suite remains compatible with clean CI and existing real users.
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
- Hosted Supabase migration history includes all five local migrations. Direct
  `rls_auto_enable()` execution is denied to `anon` and `authenticated`, remains
  available to `service_role`, and performance advisors report no issues.
- The live Koyeb health, landing, and sign-in routes return `200`. A multipart
  production sign-in probe returns `303` to Supabase with the exact Koyeb
  callback and intended `/app` destination.
- GitHub Actions run `29501262596` passes both `Quality and Build` and
  `Migration and RLS Tests`; the latter starts a clean Supabase stack, applies
  all migrations, and runs the complete pgTAP/RLS suite.
- A repeatable `supabase:test:recovery` verifier now checks one-to-one rollback
  coverage, applies every rollback in reverse order on the disposable CI
  database, proves the application relations were removed, reapplies every
  migration, and reruns the complete database suite.

## External Release Gates

Local implementation is complete, but release is not approved until the
following checks run against real infrastructure:

1. Confirm the current Koyeb Free/Supabase projects are staging or production,
   then choose production log retention and backup retention.
2. Require the clean CI migration/RLS and rollback/recovery job to pass. All
   five migrations are applied to the currently linked hosted project.
3. Google identity, Drive OAuth, and Picker credentials are configured. Verify
   hosted sign-in restoration/sign-out, consent, import, reconnect, revocation,
   and account deletion with disposable data.
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

- Docker Desktop is unavailable, so the clean local Supabase stack cannot run.
  Hosted SQL execution passes; the GitHub Actions clean-database job remains the
  release authority after this push.
- Supabase advisors retain the intentional authenticated warning for
  `public.consume_request_quota(text)`. Leaked-password protection is disabled;
  the product currently exposes Google OAuth only, but enable this control if
  password authentication is introduced.
- The ChatGPT Chrome Extension is not installed, so authenticated browser
  journeys cannot be automated from this session. Repeatable browser journeys
  and physical-device accessibility/performance/install/offline-audio checks
  remain external.
- Unknown dynamic audiobook pages currently render noindex not-found UI with a
  streamed HTTP `200`; retain this known Next.js behavior unless a host-level
  hard `404` requirement is added.
- Browser codec support varies, especially for OGG and some audiobook formats;
  final capability behavior requires representative devices and files.
- `IMPLEMENTATION_PLAN.md` exceeds the generic 500-line guideline but remains a
  single cohesive planning artifact.

## Files Status

- Created:
  `supabase/migrations/20260716062426_restrict_rls_auto_enable_execution.sql`
  and its matching rollback file, plus `scripts/database-recovery.mjs`.
- Modified: `.github/workflows/ci.yml`,
  `package.json`, `docs/DEPLOYMENT.md`,
  `supabase/tests/database/initial_schema.test.sql`,
  `supabase/tests/database/request_rate_limits.test.sql`, and this handoff.
- Currently Being Edited: rollback/recovery CI verification and its release
  documentation.
- Planned to Edit: `HANDOFF.md` after CI evidence; browser/device findings may
  identify later targeted changes.
- Untouched: application source behavior, `.env`, `.env.example`, secret values,
  existing migration contents, and user Google Drive files.
