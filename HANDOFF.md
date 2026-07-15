# Quiet Library Handoff

## Project Overview

Quiet Library is a responsive web audiobook player and installable PWA for people who keep their own audiobook files in Google Drive. Users will authenticate with Google, explicitly select their own audiobook files, and stream or download them while Quiet Library synchronizes metadata, progress, bookmarks, and preferences.

The approved technical direction is a hybrid backend: Next.js owns application APIs, Drive OAuth, import, Range streaming, and synchronization; Supabase provides Google identity, SSR sessions, managed Postgres, SQL migrations/types, and RLS. The approved visual direction is a warm editorial desktop/mobile interface.

## Current State

- Phase 0 is merged into `origin/main`. Active work is on local branch `feat/phase-1-visual-shell`; local Phase 1 and Phase 2 checkpoints have not been pushed.
- This personal repository permits a normal direct push to `main` when the user explicitly asks to push or sync directly; pull requests remain the default for ambiguous requests, and force-pushing `main` remains prohibited.
- Next.js 15.5.20, React 19.1.0, TypeScript 5.9.3, Tailwind CSS 4.3.1, Zod 4.4.3, and the Supabase CLI 2.109.1 are pinned with npm 11.6.1 and Node 24.
- The Phase 1 responsive visual shell is implemented: landing, privacy, terms, auth error, application home, onboarding, library and collection states, audiobook detail, expanded player, offline management, settings, loading, error, and not-found surfaces.
- Desktop uses persistent left navigation and a bottom player; mobile uses a compact header, mini-player, and bottom navigation. All content uses mock data with no backend dependency.
- Phase 2 implementation now includes a normalized Postgres migration and rollback, explicit grants, RLS, ownership constraints, indexes, account provisioning triggers, and pgTAP security tests.
- Supabase Google identity sign-in uses SSR cookies and verified claims. Application routes are protected in middleware and again at the server layout boundary.
- Google Drive authorization is a separate Next.js-owned OAuth flow using `drive.file`, PKCE, signed/user-bound/expiring state, exact scope validation, encrypted AES-256-GCM credential envelopes, and revoke-before-delete behavior.
- Strict TypeScript, ESLint, Prettier with Tailwind ordering, Vitest, environment validation, security headers, design tokens, and a pull-request CI workflow are configured.
- The local Supabase CLI layout exists and is intentionally not linked to a remote project. Docker and hosted Supabase/Google credentials are not available, so live auth, migration, RLS, and consent verification remain pending.
- Formatting, lint, strict typecheck, 10 unit tests, production build, production route smoke checks, expected unknown-book `404`, source-size checks, and production dependency audit pass. The Phase 2 build generates 25 pages and reports zero production vulnerabilities.
- Drive Picker/import, functional audio playback, sync, offline storage, and the PWA service worker are not implemented yet.
- Phase 1 visual approval remains pending because the in-app browser was unavailable for desktop/mobile screenshots in this session.

## Last Action

Implemented the Phase 2 database and authentication slice. Added the initial schema migration, rollback, pgTAP RLS/grant tests, Supabase SSR browser/server/admin clients, middleware protection, verified-claims identity handling, Google identity sign-in/callback/sign-out, and environment modes that preserve credential-free UI preview builds. Added a separate Drive authorization-code flow with PKCE and signed state, encrypted credential persistence, reconnect support, Google revocation, and live status surfaces in onboarding/settings.

Ran ESLint, strict typecheck, 10 Vitest tests, the production build, source-size checks, `git diff --check`, and `npm audit --omit=dev`; all executable local gates pass. Database tests and provider flows could not be executed because Docker and real Supabase/Google configuration are unavailable. No live credentials were invented or committed.

## In Progress

Phase 2 code is implemented and local gates pass, but its live exit gate remains open until sign-in/session/sign-out, migration/RLS, Drive consent, and revocation can run against local or hosted services. Phase 3 Drive Picker/import is the next implementation slice. Phase 1 desktop/mobile visual review also remains open because the in-app browser is unavailable. Development and production servers are stopped.

## Pending

1. Implement Phase 3 Google Picker and transactional import: explicit-action script loading, server-side file validation, review/grouping, duplicate handling, metadata correction, and library persistence.
2. Install Docker Desktop or attach a hosted Supabase project, then run migrations, generated type output, pgTAP tests, and unauthorized-access checks.
3. Configure Supabase Google identity and the separate Google Drive OAuth client without committing secrets; verify consent, reconnect, and revoke end to end.
4. Capture and review desktop/mobile screenshots when the in-app browser becomes available; correct visual issues before closing the Phase 1 gate.
5. Continue Phases 4-7 only through their planned, independently verified checkpoints.

## Known Issues

- Docker is not installed, so `supabase start`, migration execution, generated database types, pgTAP, and local auth/RLS verification cannot run yet. Supabase CLI 2.109.1 is installed and verified.
- No hosted Supabase project or Google OAuth clients are configured, so real sign-in, session restoration, Drive consent, reconnect, and revocation remain unverified external flows.
- The in-app browser reported no available browser instances, so Phase 1 desktop/mobile visual fidelity and interaction screenshots are not yet verified. Code-level responsive and accessibility rules were applied and automated gates pass.
- Filters and player controls remain visual/mock interactions. Onboarding authorization and Drive disconnect are functional when the required external configuration is supplied.
- OGG and some audiobook codecs are not uniformly supported across browsers; runtime capability detection remains required.
- Final hosting must be validated for long-lived Range streaming, bandwidth, concurrency, and egress cost.
- `IMPLEMENTATION_PLAN.md` is over the generic 500-line guideline after Markdown formatting; it remains one cohesive planning responsibility and was not split during Phase 0.

## Files Status

- Created: Phase 1 visual files plus `supabase/migrations/20260715025503_initial_application_schema.sql`, its rollback and pgTAP test, Supabase clients under `src/lib/supabase/`, authentication under `src/features/auth/`, Drive security/integration modules under `src/features/drive/`, auth/Drive routes under `src/app/(marketing)/auth/`, `src/middleware.ts`, and `vitest.config.ts`
- Modified: environment/package/Supabase configuration, protected application layout, onboarding/settings/marketing auth links, `README.md` (Phase 2 status and routes), `HANDOFF.md` (this checkpoint), and local ignored agent rules (direct-`main` policy)
- Currently Being Edited: none
- Planned to Edit: Phase 3 Picker/import modules, import APIs/review UI, database migration/types/tests, README, and handoff; Phase 1 UI only if visual review finds issues
- Untouched: real credentials, streaming APIs, functional player state, progress synchronization, offline databases, service worker, and remote Git branches
