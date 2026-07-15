# Quiet Library Handoff

## Project Overview

Quiet Library is a responsive web audiobook player and installable PWA for people who keep their own audiobook files in Google Drive. Users will authenticate with Google, explicitly select their own audiobook files, and stream or download them while Quiet Library synchronizes metadata, progress, bookmarks, and preferences.

The approved technical direction is a hybrid backend: Next.js owns application APIs, Drive OAuth, import, Range streaming, and synchronization; Supabase provides Google identity, SSR sessions, managed Postgres, SQL migrations/types, and RLS. The approved visual direction is a warm editorial desktop/mobile interface.

## Current State

- Phase 0 is merged into `origin/main`. Active work is on local branch `feat/phase-1-visual-shell`; local Phase 1-4 checkpoints have not been pushed.
- This personal repository permits a normal direct push to `main` when the user explicitly asks to push or sync directly; pull requests remain the default for ambiguous requests, and force-pushing `main` remains prohibited.
- Next.js 15.5.20, React 19.1.0, TypeScript 5.9.3, Tailwind CSS 4.3.1, Zod 4.4.3, and the Supabase CLI 2.109.1 are pinned with npm 11.6.1 and Node 24.
- The Phase 1 responsive visual shell is implemented: landing, privacy, terms, auth error, application home, onboarding, library and collection states, audiobook detail, expanded player, offline management, settings, loading, error, and not-found surfaces.
- Desktop uses persistent left navigation and a bottom player; mobile uses a compact header, mini-player, and bottom navigation. All content uses mock data with no backend dependency.
- Phase 2 implementation now includes a normalized Postgres migration and rollback, explicit grants, RLS, ownership constraints, indexes, account provisioning triggers, and pgTAP security tests.
- Supabase Google identity sign-in uses SSR cookies and verified claims. Application routes are protected in middleware and again at the server layout boundary.
- Google Drive authorization is a separate Next.js-owned OAuth flow using `drive.file`, PKCE, signed/user-bound/expiring state, exact scope validation, encrypted AES-256-GCM credential envelopes, and revoke-before-delete behavior.
- Phase 3 implementation loads Google Picker only after an explicit click, gives it a short-lived server-refreshed access token, and sends only selected file IDs into the import contract.
- Import preview and confirmation both re-fetch Drive metadata server-side. Supported files are download-checked, duplicate-checked, grouped naturally, and editable before a single Postgres transaction creates audiobooks, files, and any bounded ID3 chapters.
- Real Supabase mode now reads imported library/book records through the signed-in RLS session; preview mode continues to use the six mock books without requiring credentials.
- Phase 4 adds an authenticated owned-file stream endpoint that validates and caps one Range, refreshes Drive access once on `401`, enforces exact partial-response headers, and pipes the upstream body without buffering it.
- A single client audio engine now powers the expanded and persistent players with seeking, skip controls, multi-file continuation, chapter jumps, rate, volume, Media Session actions/position, and duration/end-of-chapter sleep timers.
- Strict TypeScript, ESLint, Prettier with Tailwind ordering, Vitest, environment validation, security headers, design tokens, and a pull-request CI workflow are configured.
- The local Supabase CLI layout exists and is intentionally not linked to a remote project. Docker and hosted Supabase/Google credentials are not available, so live auth, migration, RLS, and consent verification remain pending.
- Formatting, lint, strict typecheck, 22 unit/component tests, production build, production route smoke checks including stream `401`, source-size checks, and production dependency audit pass. The Phase 4 build generates 23 pages and reports zero production vulnerabilities.
- Progress/bookmark sync, offline storage, and the PWA service worker are not implemented yet.
- Phase 1 visual approval remains pending because the in-app browser was unavailable for desktop/mobile screenshots in this session.

## Last Action

Implemented the Phase 4 stream/player slice. Added RLS-owned file resolution, a strict single-Range parser with a 4 MiB cap, abort/timeout propagation, Drive access refresh and retry, safe upstream error mapping, exact `206`/`Content-Range`/length validation, and no-store streamed responses. Added the shared audio context/engine, persistent and expanded functional controls, multi-file transitions, chapter seeking, playback rate, volume, Media Session, sleep timers, and component/range tests. Imported file UUIDs and chapter timing now feed the player without exposing Drive IDs.

Ran `npm run verify` with 22 Vitest/Testing Library tests, production HTTP smoke checks for book/library/health and expected unauthenticated stream `401`, source-size checks, `git diff --check`, and `npm audit --omit=dev`; all executable local gates pass. Real long-file start/seek/transition cannot be executed until Supabase/Google credentials and an imported Drive audiobook exist. The dynamic unknown-book page still renders the not-found UI as a streamed soft `200`; revisit it during Phase 7 SEO/browser hardening. No live credentials were invented or committed.

## In Progress

Phase 4 code is implemented and local gates pass, but the Phase 2-4 live exit gates remain open until migrations/RLS, sign-in/session/sign-out, Drive consent/revocation, Picker/import, and real Range playback can run against local or hosted services. Phase 5 progress, bookmarks, and synchronization are the next implementation slice. Phase 1 desktop/mobile visual review also remains open because the in-app browser is unavailable. Development and production servers are stopped.

## Pending

1. Implement Phase 5 versioned progress checkpoints, stale-write conflict handling, restore behavior, bookmarks/completion, and a resilient client queue for short network interruptions.
2. Install Docker Desktop or attach a hosted Supabase project, then run migrations, generated type output, both pgTAP suites, and unauthorized-access checks.
3. Configure Supabase Google identity plus the Drive OAuth/Picker clients without committing secrets; verify consent, Picker selection, transaction, reconnect, and revoke end to end.
4. Capture and review desktop/mobile screenshots when the in-app browser becomes available; correct visual issues before closing the Phase 1 gate.
5. Continue Phases 6-7 only through their planned, independently verified checkpoints.

## Known Issues

- Docker is not installed, so `supabase start`, migration execution, generated database types, pgTAP, and local auth/RLS verification cannot run yet. Supabase CLI 2.109.1 is installed and verified.
- No hosted Supabase project or Google OAuth clients are configured, so real sign-in, session restoration, Drive consent, reconnect, and revocation remain unverified external flows.
- The in-app browser reported no available browser instances, so Phase 1 desktop/mobile visual fidelity and interaction screenshots are not yet verified. Code-level responsive and accessibility rules were applied and automated gates pass.
- Filters remain visual/mock interactions. Authorization, Drive disconnect, Picker/import, and player controls are functional in code when the required external configuration and imported files are supplied.
- Hosting still needs real long-lived streaming validation for response streaming, bandwidth, concurrency, timeout, and egress constraints.
- Next.js returns streamed not-found UI with an HTTP `200` for an unknown dynamic audiobook in the current production smoke test; metadata includes `noindex`, but hard-404 behavior should be revisited during Phase 7 SEO/browser verification.
- OGG and some audiobook codecs are not uniformly supported across browsers; runtime capability detection remains required.
- Final hosting must be validated for long-lived Range streaming, bandwidth, concurrency, and egress cost.
- `IMPLEMENTATION_PLAN.md` is over the generic 500-line guideline after Markdown formatting; it remains one cohesive planning responsibility and was not split during Phase 0.

## Files Status

- Created: Phase 1-3 files plus the owned Range stream API; `src/features/streaming/` range/Drive/repository modules; `src/features/player/` context, engine, audio event, Media Session, and sleep modules; and player/range tests
- Modified: Drive access refresh, live library source/chapter mapping, shared app shell, expanded/persistent/chapter player components, audiobook types/page, Vitest TSX transform, `README.md` (Phase 4 status), `HANDOFF.md` (this checkpoint), and local ignored agent rules (direct-`main` policy)
- Currently Being Edited: none
- Planned to Edit: Phase 5 progress/bookmark APIs, migrations/RLS/tests, client checkpoint queue, player integration, README, and handoff; Phase 1 UI only if visual review finds issues
- Untouched: real credentials, offline databases, service worker, and remote Git branches
