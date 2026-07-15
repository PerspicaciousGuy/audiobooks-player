# Quiet Library

Quiet Library is a responsive web audiobook player and installable PWA for
people who keep their own audiobook files in Google Drive. The application will
stream user-selected files without copying the source audio to application
storage, while synchronizing metadata, progress, bookmarks, and preferences.

## Current status

Phases 0 and 1 are implemented, and the Phase 2-3 backend code is complete
pending live-provider verification. The repository includes the responsive
visual shell, RLS-backed Supabase sessions, separate secure Drive authorization,
explicit-action Google Picker loading, server-side Drive validation, bounded
ID3 metadata/chapter parsing, editable file grouping, duplicate handling, and a
transactional import into the real library. Functional playback, sync, offline
storage, and the service worker remain later-phase work. Final desktop/mobile
visual approval for Phase 1 also remains pending.

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

| Command                    | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `npm run dev`              | Start the Next.js development server          |
| `npm run build`            | Create a production build                     |
| `npm run start`            | Serve the production build                    |
| `npm run format`           | Format tracked project files                  |
| `npm run format:check`     | Check formatting without changing files       |
| `npm run lint`             | Run ESLint                                    |
| `npm run typecheck`        | Run the strict TypeScript compiler check      |
| `npm run test`             | Run unit tests with Vitest                    |
| `npm run test:coverage`    | Run unit tests with V8 coverage               |
| `npm run verify`           | Run formatting, lint, types, tests, and build |
| `npm run supabase:start`   | Start the local Supabase stack with Docker    |
| `npm run supabase:status`  | Show local Supabase service status            |
| `npm run supabase:stop`    | Stop the local Supabase stack                 |
| `npm run supabase:test:db` | Run pgTAP database and RLS tests              |

## Environment configuration

Copy `.env.example` to `.env.local`. Only `NEXT_PUBLIC_` variables may enter the
browser bundle. Supabase secret keys, database URLs, Google client secrets, and
the Drive token-encryption key must remain server-only.

No real credentials are required in the default preview mode. Set the documented
auth and Drive modes only after supplying every corresponding server value. The
Drive encryption key must be a canonical base64-encoded 32-byte key. Secrets
must never be committed.

## Routes

| Route                           | Current purpose                                               |
| ------------------------------- | ------------------------------------------------------------- |
| `/`                             | Responsive public landing page                                |
| `/privacy`, `/terms`            | Privacy model and terms previews                              |
| `/auth/error`                   | Safe authentication failure state                             |
| `/auth/sign-in`                 | Preview or Supabase Google identity sign-in                   |
| `/auth/callback`                | Supabase PKCE session exchange                                |
| `/auth/drive/start`             | User-bound Google Drive authorization start                   |
| `/auth/drive/callback`          | Scope validation and encrypted credential persistence         |
| `/app`                          | Continue listening and recent-book home                       |
| `/app/onboarding`               | Drive connection and first-import preview                     |
| `/app/import`                   | Picker selection, grouping review, and confirmed import       |
| `/app/library`                  | Search/filter library shell and previewable collection states |
| `/app/audiobooks/[audiobookId]` | Book detail, chapters, bookmarks, and expanded player shell   |
| `/app/offline`                  | Device download and storage-management shell                  |
| `/app/settings`                 | Playback, appearance, Drive, and account settings             |
| `/health`                       | Unauthenticated, non-cached process health response           |

Authenticated application APIs currently include
`GET /api/v1/drive/picker-token`, `POST /api/v1/imports/preview`, and
`POST /api/v1/imports`. Import confirmation never trusts Picker metadata from
the browser; the server re-fetches every selected Drive file before calling the
single-transaction database function.

## CI plan

The pull-request workflow installs from the lockfile, checks formatting, lints,
typechecks, runs unit tests, builds, and audits production dependencies. pgTAP
database/RLS tests are versioned under `supabase/tests/database` and require a
running local or hosted Supabase database. Browser tests remain a later-phase
addition following `IMPLEMENTATION_PLAN.md`.
