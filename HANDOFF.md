# Quiet Library Handoff

## Project Overview

Quiet Library is a responsive web audiobook player and installable PWA for people who keep their own audiobook files in Google Drive. Users will authenticate with Google, explicitly select their own audiobook files, and stream or download them while Quiet Library synchronizes metadata, progress, bookmarks, and preferences.

The approved technical direction is a hybrid backend: Next.js owns application APIs, Drive OAuth, import, Range streaming, and synchronization; Supabase provides Google identity, SSR sessions, managed Postgres, SQL migrations/types, and RLS. The approved visual direction is a warm editorial desktop/mobile interface.

## Current State

- Phase 0 is complete on branch `feat/phase-0-foundation` and published to `https://github.com/PerspicaciousGuy/audiobooks-player.git` through a draft pull request targeting `main`.
- This personal repository permits a normal direct push to `main` when the user explicitly asks to push or sync directly; pull requests remain the default for ambiguous requests, and force-pushing `main` remains prohibited.
- Next.js 15.5.20, React 19.1.0, TypeScript 5.9.3, Tailwind CSS 4.3.1, Zod 4.4.3, and the Supabase CLI 2.109.1 are pinned with npm 11.6.1 and Node 24.
- Public `/`, application `/app`, and unauthenticated `/health` route foundations are implemented.
- Strict TypeScript, ESLint, Prettier with Tailwind ordering, environment validation, security headers, design tokens, and a pull-request CI workflow are configured.
- The local Supabase CLI layout exists and is intentionally not linked to a remote project.
- `npm ci`, formatting, lint, typecheck, production build, dependency audit, and live route smoke checks pass.
- No authentication, database migrations, Google integration, production UI, player, tests, or PWA service worker has been implemented.

## Last Action

Added a project-specific Git policy exception to `AGENTS.md` and `agents-guidelines/core/git-rules.md`: when the user explicitly requests a direct push or sync to `main`, agents may do so after fetching and verifying the remote state, diff, secrets, and relevant checks. The exception permits only a normal non-force push; a pull request remains the default when the request is ambiguous. The existing draft pull request and remote branches were not changed.

## In Progress

Nothing. Phase 0 is complete and the development server has been stopped.

## Pending

1. Review and merge the Phase 0 draft pull request when ready, or explicitly request a verified direct sync to `main`.
2. Execute Phase 1 as a separately approved task: production landing page and responsive application UI shells with mock data.
3. Install Docker Desktop or a compatible runtime before local Supabase services are required in Phase 2.
4. Configure Google and remote Supabase credentials only in their approved phases.
5. Add test tooling and tests with the features they verify, following `IMPLEMENTATION_PLAN.md`.

## Known Issues

- Docker is not installed, so `supabase start` and local database/auth container verification cannot run yet. `supabase init` and CLI 2.109.1 were verified.
- The `/` and `/app` screens are intentional Phase 0 foundations, not the approved production UI.
- The generated landing-page concept used a static 2024 footer year; Phase 1 must use the current year dynamically.
- OGG and some audiobook codecs are not uniformly supported across browsers; runtime capability detection remains required.
- Final hosting must be validated for long-lived Range streaming, bandwidth, concurrency, and egress cost.
- `IMPLEMENTATION_PLAN.md` is over the generic 500-line guideline after Markdown formatting; it remains one cohesive planning responsibility and was not split during Phase 0.

## Files Status

- Created: `AGENTS.md`, `agents-guidelines/`, `IMPLEMENTATION_PLAN.md`, `HANDOFF.md`, `.editorconfig`, `.env.example`, `.gitignore`, `.nvmrc`, `.prettierignore`, `.github/workflows/ci.yml`, `README.md`, `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`, `prettier.config.mjs`, `postcss.config.mjs`, `next.config.ts`, `next-env.d.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/page.tsx`, `src/app/(application)/app/layout.tsx`, `src/app/(application)/app/page.tsx`, `src/app/health/route.ts`, `src/lib/config/environment.ts`, `supabase/config.toml`, `supabase/.gitignore`
- Modified: `AGENTS.md` and `agents-guidelines/core/git-rules.md` (project-specific direct-`main` exception), `IMPLEMENTATION_PLAN.md` (formatted and marked Phase 0 complete with Phase 1 as the next slice), `HANDOFF.md` (Git policy and current checkpoint)
- Currently Being Edited: none
- Planned to Edit: Phase 1 UI route/components and design tokens after explicit approval
- Untouched: application source, dependency manifests, CI workflow, Supabase configuration, and the existing GitHub pull request
