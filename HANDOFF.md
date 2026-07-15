# Quiet Library Handoff

## Project Overview

Quiet Library is a responsive web audiobook player and installable PWA for people who keep their own audiobook files in Google Drive. Users will authenticate with Google, explicitly select their own audiobook files, and stream or download them while Quiet Library synchronizes metadata, progress, bookmarks, and preferences.

The approved technical direction is a hybrid backend: Next.js owns application APIs, Drive OAuth, import, Range streaming, and synchronization; Supabase provides Google identity, SSR sessions, managed Postgres, SQL migrations/types, and RLS. The approved visual direction is a warm editorial desktop/mobile interface.

## Current State

- Phase 0 is merged into `origin/main`. Active work is on local branch `feat/phase-1-visual-shell`; local Phase 1-5 checkpoints have not been pushed.
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
- Phase 5 adds an authenticated atomic progress RPC with client timestamp plus expected-version conflict checks, cross-book file/chapter integrity, and a bounded local retry queue that retains only the newest pending checkpoint per book.
- Resume restores the accepted file, position, and rate; checkpoints save on intervals, pause, source transitions, visibility/page hide, and online recovery. Near-end checkpoints mark completion explicitly.
- Bookmark creation and owned deletion are integrated into the player/book detail with server-side ownership/FK enforcement and refreshed lists.
- Strict TypeScript, ESLint, Prettier with Tailwind ordering, Vitest, environment validation, security headers, design tokens, and a pull-request CI workflow are configured.
- The local Supabase CLI layout exists and is intentionally not linked to a remote project. Docker and hosted Supabase/Google credentials are not available, so live auth, migration, RLS, and consent verification remain pending.
- Formatting, lint, strict typecheck, 24 unit/component tests, production build, production route smoke checks including progress/bookmark `401`, source-size checks, and production dependency audit pass. The Phase 5 build generates 23 pages and reports zero production vulnerabilities.
- Offline audio storage and the PWA service worker are not implemented yet.
- Phase 1 visual approval remains pending because the in-app browser was unavailable for desktop/mobile screenshots in this session.

## Last Action

Implemented the Phase 5 progress/bookmark slice. Added a migration that tightens file/chapter-to-book integrity and exposes an authenticated, atomic `save_playback_progress` function with timestamp/version conflict rejection; rollback and pgTAP conflict tests; progress and bookmark API contracts/routes; exact resume data in library mapping; a bounded newest-per-book localStorage retry queue; lifecycle/interval/online checkpoint synchronization; near-end completion; resume source/time/rate; and bookmark add/delete UI. Switching books/chapters and multi-file endings save the prior checkpoint before continuing.

Ran `npm run verify` with 24 Vitest/Testing Library tests, production HTTP smoke checks for expected unauthenticated progress/bookmark add/delete `401`, source-size checks, `git diff --check`, and `npm audit --omit=dev`; all executable local gates pass. Cross-device restore and stale-write behavior still require the Supabase migration and two real signed-in sessions. Real streaming remains credential-dependent. The dynamic unknown-book page remains a streamed soft `200`; revisit during Phase 7. No live credentials were invented or committed.

## In Progress

Phase 5 code is implemented and local gates pass, but the Phase 2-5 live exit gates remain open until migrations/RLS, sign-in/session/sign-out, Drive consent/revocation, Picker/import, real Range playback, and two-session stale-write/restore checks can run against local or hosted services. Phase 6 PWA installation and offline behavior are the next implementation slice. Phase 1 desktop/mobile visual review also remains open because the in-app browser is unavailable. Development and production servers are stopped.

## Pending

1. Implement Phase 6 typed manifest/icons, deliberately scoped service worker, update/offline shell UX, IndexedDB metadata, explicit device audio downloads, storage accounting, quota/error handling, and safe cache exclusions for auth/API/Range traffic.
2. Install Docker Desktop or attach a hosted Supabase project, then run migrations, generated type output, both pgTAP suites, and unauthorized-access checks.
3. Configure Supabase Google identity plus the Drive OAuth/Picker clients without committing secrets; verify consent, Picker selection, transaction, reconnect, and revoke end to end.
4. Capture and review desktop/mobile screenshots when the in-app browser becomes available; correct visual issues before closing the Phase 1 gate.
5. Continue Phase 7 only after the PWA/offline checkpoint is independently verified.

## Known Issues

- Docker is not installed, so `supabase start`, migration execution, generated database types, pgTAP, and local auth/RLS verification cannot run yet. Supabase CLI 2.109.1 is installed and verified.
- No hosted Supabase project or Google OAuth clients are configured, so real sign-in, session restoration, Drive consent, reconnect, and revocation remain unverified external flows.
- The in-app browser reported no available browser instances, so Phase 1 desktop/mobile visual fidelity and interaction screenshots are not yet verified. Code-level responsive and accessibility rules were applied and automated gates pass.
- Filters remain visual/mock interactions. Authorization, Drive disconnect, Picker/import, and player controls are functional in code when the required external configuration and imported files are supplied.
- Hosting still needs real long-lived streaming validation for response streaming, bandwidth, concurrency, timeout, and egress constraints.
- Cross-device progress restoration and stale-write rejection are implemented but cannot be live-proven without migrated Supabase plus two authenticated sessions.
- Next.js returns streamed not-found UI with an HTTP `200` for an unknown dynamic audiobook in the current production smoke test; metadata includes `noindex`, but hard-404 behavior should be revisited during Phase 7 SEO/browser verification.
- OGG and some audiobook codecs are not uniformly supported across browsers; runtime capability detection remains required.
- Final hosting must be validated for long-lived Range streaming, bandwidth, concurrency, and egress cost.
- `IMPLEMENTATION_PLAN.md` is over the generic 500-line guideline after Markdown formatting; it remains one cohesive planning responsibility and was not split during Phase 0.

## Files Status

- Created: Phase 1-4 files plus the progress conflict/integrity migration, rollback, and pgTAP test; progress/bookmark APIs and contracts; local retry queue/sync hook; source selection and bookmark hooks; bookmark list component; and queue tests
- Modified: live progress/resume mapping, shared player context/engine/audio, expanded player and book detail, audiobook types, `README.md` (Phase 5 status), `HANDOFF.md` (this checkpoint), and local ignored agent rules (direct-`main` policy)
- Currently Being Edited: none
- Planned to Edit: Phase 6 manifest/icons/service worker/offline storage and download UI, tests, README, and handoff; Phase 1 UI only if visual review finds issues
- Untouched: real credentials and remote Git branches
