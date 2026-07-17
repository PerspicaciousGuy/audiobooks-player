# Quiet Library

Quiet Library is a responsive web audiobook player and installable PWA for
people who keep their own audiobook files in Google Drive. The application can
stream user-selected files without copying the source audio to application
storage, while synchronizing metadata, progress, bookmarks, and preferences.

## Current status

Phases 0 and 1, the local Phase 6 implementation, and the local Phase 7
hardening work are complete. Phase 2-5 application code is complete pending
live-provider verification. The repository includes the responsive visual
shell, real library search and filters, a mobile account menu, synced playback
and theme preferences, editable book metadata, RLS-backed Supabase sessions,
separate secure Drive authorization, explicit-action Google Picker loading,
server-side Drive validation, one-time `Audiobooks` folder selection, explicit
multi-file Picker access, bounded ID3 metadata/chapter parsing, editable file grouping,
duplicate handling, and a transactional import into the real
library. The shared player uses one audio element, an authenticated
bounded-Range proxy, multi-file continuation, chapter jumps, Media Session,
account-defined skip/rate defaults, volume, and sleep controls. Versioned
progress uses atomic stale-write rejection and a bounded device retry queue;
resume, completion, and bookmark add/delete are integrated into the player.
The installable PWA adds an update-aware service worker, a branded offline
shell, explicit OPFS/Cache Storage downloads indexed with Dexie, storage
accounting, partial/evicted-file reconciliation, and offline multi-file
playback. Desktop and exact 390x844 mobile browser audits pass without
horizontal overflow; representative-device install and airplane-mode playback
remain release gates. Release hardening adds account deletion, origin
enforcement, private database-backed quotas, CSP/HSTS, redacted structured
events, RFC 9457 API errors, accessibility checks, complete versioned library
APIs, a repeatable production HTTP smoke check, and deployment/incident/OAuth
guides.

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
| `npm run test:smoke`       | Smoke-test the already-built production app   |
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

| Route                           | Current purpose                                                      |
| ------------------------------- | -------------------------------------------------------------------- |
| `/`                             | Responsive public landing page                                       |
| `/privacy`, `/terms`            | Privacy model and terms previews                                     |
| `/auth/error`                   | Safe authentication failure state                                    |
| `/auth/sign-in`                 | Preview or Supabase Google identity sign-in                          |
| `/auth/callback`                | Supabase PKCE session exchange                                       |
| `/auth/drive/start`             | User-bound Google Drive authorization start                          |
| `/auth/drive/callback`          | Scope validation and encrypted credential persistence                |
| `/app`                          | Continue listening and recent-book home                              |
| `/app/onboarding`               | Drive connection and first-import preview                            |
| `/app/import`                   | Folder selection, explicit file choice, review, and confirmed import |
| `/app/library`                  | Search/filter library shell and previewable collection states        |
| `/app/audiobooks/[audiobookId]` | Book detail, chapters, bookmarks, and expanded player shell          |
| `/app/offline`                  | Device downloads, offline playback, and storage management           |
| `/offline`                      | Public branded offline fallback and device-library access            |
| `/app/settings`                 | Playback, appearance, Drive, and account settings                    |
| `/health`                       | Unauthenticated, non-cached process health response                  |

Authenticated application APIs currently include
`GET /api/v1/library`, `GET/PATCH /api/v1/audiobooks/[audiobookId]`,
`PATCH /api/v1/preferences`,
`GET /api/v1/drive/picker-token`, `PUT /api/v1/drive/folder`,
`POST /api/v1/imports/preview`, and `POST /api/v1/imports`, plus the owned-file-only
`GET /api/v1/audiobooks/[audiobookId]/stream?fileId=...` endpoint. Import
confirmation never trusts Picker metadata from the browser; the server
re-fetches every selected Drive file before calling the single-transaction
database function. Streaming forwards one capped Range and pipes the Drive body
without buffering the audiobook in application memory.

Completed offline downloads use the separate authenticated
`GET /api/v1/audiobooks/[audiobookId]/download?fileId=...` endpoint. The
service worker deliberately excludes authenticated application pages, APIs,
Range traffic, and audio responses from its caches; audio is stored only after
an explicit device-download action.

Playback persistence uses
`PUT /api/v1/audiobooks/[audiobookId]/progress`,
`POST /api/v1/audiobooks/[audiobookId]/bookmarks`, and
`DELETE /api/v1/bookmarks/[bookmarkId]`. Progress responses return the accepted
server version; stale timestamps or expected versions cannot overwrite newer
listening positions. `DELETE /api/v1/account` revokes Drive credentials before
deleting the Supabase Auth user and cascade-owned application data; it never
deletes source files from Google Drive.

## CI plan

The main-branch and pull-request workflow installs from the lockfile, checks
formatting, lints, typechecks, runs unit tests, builds, runs the production HTTP
smoke check, and audits production dependencies. pgTAP database/RLS tests are versioned under
`supabase/tests/database` and require a running local or hosted Supabase
database. The local release audit covers rendered mobile/desktop routes and
critical interactions through Chrome DevTools; repeatable Playwright journeys
remain part of provider-backed staging validation.
