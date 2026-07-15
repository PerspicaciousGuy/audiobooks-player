# Quiet Library

Quiet Library is a responsive web audiobook player and installable PWA for
people who keep their own audiobook files in Google Drive. The application will
stream user-selected files without copying the source audio to application
storage, while synchronizing metadata, progress, bookmarks, and preferences.

## Current status

Phase 0 is complete and the Phase 1 visual shell is implemented. The repository
contains the responsive landing page, desktop and mobile application shells,
mock home/library/book/player/offline/settings experiences, required UI states,
design tokens, environment validation, a health endpoint, local Supabase CLI
configuration, and CI quality checks. Authentication, Google Drive access,
functional audio playback, persistence, and PWA behavior are not implemented
yet. Final desktop/mobile visual approval for Phase 1 remains pending.

## Architecture

- Next.js App Router owns UI routes, server-side application behavior, Google
  Drive OAuth, imports, Range streaming, and synchronization.
- Supabase will provide Google identity, SSR sessions, managed Postgres,
  migrations, generated types, and row-level security.
- Audiobook files remain in each user's Google Drive. Offline copies remain on
  the user's device.
- Supabase Edge Functions and Storage are not used as the audiobook streaming
  path.

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the phased delivery
plan and [HANDOFF.md](./HANDOFF.md) for the current checkpoint.

## Prerequisites

- Node.js 24
- npm 11.6.1
- Docker Desktop or another Docker-compatible runtime when running the local
  Supabase stack

The web application can run without Docker during Phases 0 and 1. Docker is
required before `npm run supabase:start` can launch the local Supabase services.

## Local setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The operational health response is available at
`http://localhost:3000/health`.

## Commands

| Command                   | Purpose                                          |
| ------------------------- | ------------------------------------------------ |
| `npm run dev`             | Start the Next.js development server             |
| `npm run build`           | Create a production build                        |
| `npm run start`           | Serve the production build                       |
| `npm run format`          | Format tracked project files                     |
| `npm run format:check`    | Check formatting without changing files          |
| `npm run lint`            | Run ESLint                                       |
| `npm run typecheck`       | Run the strict TypeScript compiler check         |
| `npm run verify`          | Run formatting, linting, typechecking, and build |
| `npm run supabase:start`  | Start the local Supabase stack with Docker       |
| `npm run supabase:status` | Show local Supabase service status               |
| `npm run supabase:stop`   | Stop the local Supabase stack                    |

## Environment configuration

Copy `.env.example` to `.env.local`. Only `NEXT_PUBLIC_` variables may enter the
browser bundle. Supabase secret keys, database URLs, Google client secrets, and
the Drive token-encryption key must remain server-only.

No real credentials are required for Phases 0 and 1. They will be configured in
their approved implementation phases and must never be committed.

## Routes

| Route                           | Current purpose                                               |
| ------------------------------- | ------------------------------------------------------------- |
| `/`                             | Responsive public landing page                                |
| `/privacy`, `/terms`            | Privacy model and terms previews                              |
| `/auth/error`                   | Safe authentication failure state                             |
| `/app`                          | Continue listening and recent-book home                       |
| `/app/onboarding`               | Drive connection and first-import preview                     |
| `/app/library`                  | Search/filter library shell and previewable collection states |
| `/app/audiobooks/[audiobookId]` | Book detail, chapters, bookmarks, and expanded player shell   |
| `/app/offline`                  | Device download and storage-management shell                  |
| `/app/settings`                 | Playback, appearance, Drive, and account settings             |
| `/health`                       | Unauthenticated, non-cached process health response           |

## CI plan

The initial pull-request workflow installs from the lockfile, checks formatting,
lints, typechecks, builds, and audits production dependencies. Unit,
integration, database, and browser test stages will be added with the features
they verify, following the test plan in `IMPLEMENTATION_PLAN.md`.
