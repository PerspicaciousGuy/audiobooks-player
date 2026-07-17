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
- A Koyeb Free web service in Frankfurt and a Supabase Free project are
  configured as the portfolio staging environment, not production. Real
  credentials live only in ignored local environment files and provider secret
  managers.
- Phase 1 provides the responsive warm-editorial landing and application UI for
  desktop and mobile, including principal empty/loading/error states, live
  library search/filters, mobile account navigation, editable book details,
  account-backed preferences, theme selection, and keyboard/reduced-motion
  accessibility behavior.
- Phase 2 provides Supabase SSR authentication, normalized/RLS-protected data,
  and a separate user-bound Drive OAuth flow with PKCE, exact scopes, encrypted
  credentials, reconnect, and revoke-before-delete.
- Phase 3 provides one-time `Audiobooks` folder selection through Google
  Picker, recursive folder-only scanning, server-side Drive validation, bounded
  ID3/chapter parsing, editable grouping, duplicate checks, transactional
  import, and real library reads.
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

Diagnosed the remaining hosted Google Picker error without changing application
or secret files. The implementation already supplies the developer key, Cloud
project number, OAuth token, and current origin in the documented Picker flow.
The local environment values have the expected key/project formats with no
quotes or surrounding whitespace.

A redacted Google API probe initially returned `403 PERMISSION_DENIED` with
Drive file listing explicitly blocked. After Google Drive API was added to the
same browser key, the probe changed to the expected file-permission response,
confirming that Google now accepts the key and both API restrictions. The
embedded Picker still shows its generic developer-key screen, so Chrome's
blocked third-party-cookie/extension path is now the active check. The active
Chrome profile is not available to this agent for direct inspection.

After third-party cookies were allowed, Picker opened and saved the selected
`Audiobooks` folder. Its recursive scan returned no files even though the folder
contains an M4B. Review found that the current OAuth scope is `drive.file`,
which grants per-file access to files explicitly opened or shared through
Picker; selecting a folder does not grant blanket access to its pre-existing
children. The detector also lacks some valid M4B MIME aliases, but MIME
expansion alone cannot make an unauthorized child visible to the Drive list
call.

## In Progress

The application code and folder migration are on `main`, Google accepts the
configured browser key, and Picker works with third-party cookies allowed. Work
is paused before changing the import model: retain least-privilege `drive.file`
with explicit multi-file selection, or request broader read-only Drive access
for automatic recursive folder scanning. Mock content also still needs to be
limited to preview mode after that choice.

## Pending

- Choose the Drive access model: recommended explicit multi-file Picker
  selection under `drive.file`, or broader read-only Drive access with OAuth
  verification/privacy implications for automatic folder scanning.
- Expand accepted M4B MIME aliases and add regression tests after the access
  model is chosen.
- Keep mock books/player content only in preview mode; authenticated Supabase
  users should see owned books or an empty state.
- Complete the remaining hosted progress, bookmark, reconnect/revoke,
  account-deletion, PWA, and physical-device evidence flows.

## Verification

- `npm run verify`: formatting, ESLint, strict TypeScript, 71 tests in 26 files,
  the 29-route production build, and the production HTTP smoke check pass.
- Focused folder/import tests pass for exact-name validation, recursive nested
  audio discovery, unsupported-file filtering, and the 25-file safety limit.
- Linked Supabase migration history includes
  `20260717012455_add_drive_audiobooks_folder`; direct catalog queries confirm
  both columns and all three constraints. Security advisors retain only the two
  known warnings below, and performance advisors report no issues.
- GitHub Actions run `29547931919` passed both Quality and Build and the
  disposable Migration and RLS Tests job, including rollback/recovery.
- The local Picker key is present, has the expected 39-character `AIza` format,
  and contains no quotes/outer whitespace. After adding Google Drive API to the
  key, its redacted probe reaches the Drive service and returns a file-level
  permission response instead of an API-key or API-restriction error.
- A production server deliberately reached through `http://localhost:3100`
  returns the canonical Koyeb origin from Drive start, Drive callback, and
  Supabase callback routes. This reproduces the proxy-origin condition without
  allowing it to control the redirect destination.
- Live Koyeb probes after deployment return the canonical Koyeb origin from
  `/auth/drive/start`, `/auth/drive/callback`, and `/auth/callback`; none return
  localhost. GitHub Actions run `29504091895` passes quality/build and the clean
  migration/RLS/rollback-recovery job for commit `fb9771c`.
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
- GitHub Actions run `29502764950` passes both `Quality and Build` and
  `Migration and RLS Tests`; the latter starts a clean Supabase stack, applies
  all migrations, runs the complete pgTAP/RLS suite, rolls every application
  migration back, reapplies them, and passes the database suite again.
- A repeatable `supabase:test:recovery` verifier now checks one-to-one rollback
  coverage, applies every rollback in reverse order on the disposable CI
  database, proves the application relations were removed, reapplies every
  migration, and reruns the complete database suite.
- Environment classification and retention are decided: the current free
  providers are staging; production requires seven-day logs, seven daily
  restore points, and 30-day encrypted pre-release logical exports.

## External Release Gates

Local implementation is complete, but release is not approved until the
following checks run against real infrastructure:

1. Google identity, Drive OAuth, and Picker credentials are configured. Verify
   hosted sign-in restoration/sign-out, consent, import, reconnect, revocation,
   and account deletion with disposable data.
2. Validate large-file Range streaming, full downloads, host concurrency,
   timeout, bandwidth, and egress behavior.
3. Use two authenticated sessions to prove stale-write rejection, progress
   restoration, and bookmark isolation.
4. Reconfirm the passing local visuals on representative physical devices and
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
- A single folder scan is intentionally limited to 25 supported audio files and
  100 folders. Larger-library batching is not implemented yet.
- Real `drive.file` folder traversal and playback still require the hosted,
  authenticated Google account check after Koyeb receives the project number.
- `IMPLEMENTATION_PLAN.md` exceeds the generic 500-line guideline but remains a
  single cohesive planning artifact.

## Files Status

- Created: the folder-selection route, Drive folder contracts/scanner/tests,
  import client helper and selected-folder panel, plus migration
  `20260717012455_add_drive_audiobooks_folder.sql` and its rollback.
- Modified: `.env.example`, `README.md`, Drive deployment/OAuth docs, import,
  onboarding, home, settings, privacy, and marketing copy/components; Drive
  repository, import contracts/validation/preview route, Picker types and
  environment validation; the initial-schema pgTAP test; and this handoff.
- Currently Being Edited: none after verification.
- Planned to Edit: only targeted findings from the hosted folder import and
  remaining device release checks.
- Untouched: `.env`, secret values, existing migration contents, imported book
  records, and user Google Drive files.
