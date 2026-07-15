# Quiet Library Implementation Plan

## 1. Purpose

Quiet Library is a responsive web audiobook player and installable PWA for people who keep their own audiobook files in Google Drive. Users authenticate with Google, explicitly select audiobook files, organize them into a personal library, stream or download them, and keep playback progress synchronized across devices.

This document is the implementation source of truth until a newer approved decision replaces it.

## 2. Approved Product Direction

- Working name: **Quiet Library**.
- Visual direction: warm editorial interface with an off-white background, ink-colored text, muted amber accents, serif display typography, and restrained surfaces.
- Public entry: a concise landing page at `/` for signed-out visitors.
- Returning signed-in users: redirect from `/` to `/app`.
- Primary storage: users' own Google Drive files.
- MVP Drive permission model: Google Picker with `drive.file`; users explicitly choose accessible files.
- Server storage: metadata, progress, bookmarks, preferences, sessions, and encrypted OAuth credentials.
- Audio storage: files remain in Google Drive; offline copies remain only on the user's device.
- Initial formats: MP3, M4B, M4A, AAC, and OGG where the browser can decode them.
- No server-side transcoding in the MVP.
- Backend approach: Supabase-managed Auth/Postgres plus a custom Next.js application backend.

## 3. MVP Goals

The MVP is complete when a new user can:

1. Understand the product and its privacy model from the landing page.
2. Sign in with Google and connect Google Drive.
3. Select supported audiobook files with Google Picker.
4. Review and confirm detected book metadata and file grouping.
5. Browse a responsive library on desktop and mobile.
6. Stream an audiobook with seeking, chapter navigation, speed control, sleep timer, and bookmarks.
7. Leave and resume at the saved position on another signed-in device.
8. Install the PWA and download selected books for offline playback when device storage permits.
9. Disconnect Drive or delete their Quiet Library account and stored metadata.

## 4. Explicit Non-Goals for the MVP

- Public audiobook catalog, purchasing, subscriptions, or payments.
- Uploading or permanently storing audiobook audio on Quiet Library servers.
- Social features, reviews, sharing, or public profiles.
- DRM-protected audiobook playback.
- Audio transcoding or format conversion.
- Automatic access to the user's entire Drive.
- Native iOS or Android applications.
- Admin dashboard beyond operational health and logs.
- AI-generated summaries, transcripts, or recommendations.

## 5. Proposed Stack

| Concern                | Choice                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Framework              | Next.js App Router                                                                 |
| Language               | TypeScript with the repository's strict compiler rules                             |
| UI                     | React, Tailwind CSS 4, and selected shadcn/ui primitives                           |
| Design tokens          | Tailwind `@theme` in the single global stylesheet                                  |
| Authentication         | Supabase Auth for Google identity and SSR-compatible sessions                      |
| Google integration     | Separate Next.js-owned Drive OAuth, Google Picker, and Drive API v3                |
| Database               | Supabase-managed PostgreSQL                                                        |
| Database access        | Supabase server clients, generated types, RLS, and SQL functions for transactions  |
| Migrations             | Supabase CLI SQL migrations reviewed before application                            |
| Validation             | Zod at environment, action, API, and third-party boundaries                        |
| Server state           | Server Components first; TanStack Query for interactive client fetching            |
| Player state           | A focused Zustand player store; never OAuth tokens or server data                  |
| Offline metadata       | IndexedDB through Dexie                                                            |
| Offline audio          | OPFS when available, with an IndexedDB fallback evaluated during the offline phase |
| Playback               | Native `HTMLAudioElement` and Media Session API                                    |
| Unit/integration tests | Vitest and React Testing Library                                                   |
| Browser tests          | Playwright                                                                         |
| Deployment             | Provider-neutral Next.js hosting plus the managed Supabase platform                |

Exact package versions will be pinned and reviewed during scaffolding. No dependency is installed merely because it appears in this plan.

## 6. Architecture

Quiet Library will use a hybrid Backend-for-Frontend pattern: Supabase provides managed infrastructure, while the Next.js server owns application behavior and the Google Drive boundary.

```text
Browser / installed PWA
        |
        | secure session cookie
        v
Next.js application
  - Server Components and Server Actions
  - versioned Route Handlers
  - Supabase SSR session validation
  - Drive OAuth callback and token refresh
  - Drive metadata adapter
  - authenticated Range streaming proxy
        |
        +---- Supabase Auth: Google identity and application sessions
        |
        +---- Supabase Postgres: metadata, progress, bookmarks, RLS
        |
        +---- Google Drive API: user-selected source audio
```

Architectural rules:

- Supabase Google sign-in requests identity scopes only; Drive access is a separate grant.
- The browser never receives a Google Drive refresh token.
- The Drive authorization-code exchange happens server-side with PKCE and validated state.
- Supabase sessions use secure SSR cookie handling.
- Every exposed user-owned table has RLS, explicit grants, and indexed ownership columns.
- Secret/service-role credentials remain server-only; browser code receives only the publishable key.
- Encrypted Drive credentials live in an unexposed private schema.
- Drive responses are treated as untrusted external data and validated.
- The player does not copy server data into Zustand; Zustand owns only live playback state.
- Server-only modules use `server-only` and never cross into the client bundle.
- All API errors use RFC 9457 Problem Details where a JSON error response is appropriate.

## 7. Route Map

### Public routes

| Route         | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `/`           | Session-aware landing page; signed-in users redirect to `/app` |
| `/privacy`    | Privacy policy and Drive data explanation                      |
| `/terms`      | Terms of use                                                   |
| `/auth/error` | Safe authentication failure state                              |
| `/health`     | Unauthenticated readiness response without sensitive details   |

### Authenticated application routes

| Route                           | Purpose                                                              |
| ------------------------------- | -------------------------------------------------------------------- |
| `/app`                          | Continue listening, recent books, and connection status              |
| `/app/onboarding`               | Connect Drive and add the first audiobook                            |
| `/app/library`                  | Search, filter, and browse the library                               |
| `/app/audiobooks/[audiobookId]` | Book details, chapters, metadata, and playback                       |
| `/app/offline`                  | Device-local downloads and storage usage                             |
| `/app/settings`                 | Playback preferences, Drive connection, privacy, and account actions |

### Versioned internal API surface

| Endpoint                                          | Responsibility                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `GET /api/v1/library`                             | Cursor-paginated authenticated library data                        |
| `POST /api/v1/imports/preview`                    | Validate selected IDs and return editable groups                   |
| `POST /api/v1/imports`                            | Validate selected Drive file IDs and create/update library records |
| `GET /api/v1/audiobooks/[audiobookId]`            | Authenticated audiobook details                                    |
| `PATCH /api/v1/audiobooks/[audiobookId]`          | User metadata corrections                                          |
| `GET /api/v1/audiobooks/[audiobookId]/stream`     | Range-aware authenticated audio stream                             |
| `GET /api/v1/audiobooks/[audiobookId]/download`   | Explicit authenticated full-file device download                   |
| `PUT /api/v1/audiobooks/[audiobookId]/progress`   | Idempotent playback checkpoint update                              |
| `POST /api/v1/audiobooks/[audiobookId]/bookmarks` | Create a bookmark                                                  |
| `DELETE /api/v1/bookmarks/[bookmarkId]`           | Delete an owned bookmark                                           |
| `PATCH /api/v1/preferences`                       | Validate and persist playback and appearance defaults              |
| `DELETE /api/v1/account`                          | Revoke Drive and delete owned application data                     |

Supabase Auth callback/session routes remain framework-controlled and are not treated as public application API resources. Drive disconnection is a protected server action because it terminates in a UI redirect.

## 8. Core User Flows

### First visit

```text
Landing page
  -> Connect Google Drive
  -> Supabase Google sign-in with identity scopes
  -> Explain and authorize separate Drive access
  -> Google Picker
  -> Import review
  -> Library home
```

### Returning user

```text
Open `/` or installed PWA
  -> valid session and library: `/app`
  -> valid session, empty library: `/app/onboarding`
  -> expired Drive grant: reconnect state with local progress preserved
```

### Playback

```text
Choose book
  -> load metadata and saved checkpoint
  -> request authenticated stream with Range header
  -> play locally
  -> checkpoint after meaningful progress and on pause/page hide
  -> resume from latest accepted checkpoint
```

### Offline download

```text
Choose Download
  -> check browser capability and storage estimate
  -> request persistent storage when appropriate
  -> download from authenticated stream endpoint
  -> verify completed bytes
  -> register device-local copy
  -> play without network
```

## 9. UX Surfaces and Required States

### Landing page

- Approved headline: “Your audiobooks. Your Drive. Your place.”
- Primary action: “Connect Google Drive.”
- Explain the three-step flow and the file-selection privacy model.
- Use the approved desktop and mobile product previews.
- Use a dynamic copyright year; do not copy the mockup's static 2024 value.

### Application shell

- Desktop: left navigation and persistent bottom player.
- Mobile: bottom navigation and mini-player above it.
- Expanded player: cover, chapter, scrubber, rewind/forward, speed, sleep timer, bookmarks, and chapter list.
- All interactive targets are at least 44 by 44 CSS pixels.

### Required non-happy states

- New/empty library.
- Connecting and reconnecting Drive.
- User cancels Google consent or Picker.
- Expired or revoked Drive access.
- Import scanning and partial import success.
- Duplicate files and ambiguous grouping.
- Unsupported MIME type or browser codec.
- Missing cover, title, author, narrator, duration, or chapters.
- Drive file moved, deleted, or no longer downloadable.
- Streaming timeout, lost connection, and retry.
- Offline with no downloaded copy.
- Insufficient device storage or storage permission denied.
- Loading, empty, error, and retry states for every fetched collection.

## 10. Data Model

All primary keys are UUIDs. Database identifiers use snake_case; generated TypeScript properties use camelCase at application boundaries. Every owned resource includes `userId` referencing `auth.users`, and both RLS and server logic verify ownership.

### `profiles`

- Application profile keyed to the corresponding Supabase `auth.users` row.
- Fields: `id`, `displayName`, `avatarUrl`, timestamps; authorization never trusts editable user metadata.

### Supabase-managed auth schema

- Supabase owns identities, provider sign-in, and application sessions in its managed auth schema.
- Drive authorization remains separate and its credentials are never treated as Supabase provider-session data.

### `drive_connections`

- Private, unexposed table with one active Google Drive connection per user in the MVP.
- Fields: Google account identifier, granted scopes, encrypted refresh-token envelope, access-token expiry metadata, status, last validated time, timestamps.
- Encryption key comes from the deployment secret manager, never the database or repository.

### `audiobooks`

- User-facing logical book.
- Fields: title, author, narrator, series, series position, description, cover metadata, total duration, import status, timestamps.
- User corrections take precedence over detected metadata.

### `audiobook_files`

- One or more selected Drive files belonging to a logical audiobook.
- Fields: audiobook ID, Drive file ID, name, MIME type, byte size, checksum/version metadata when available, duration, sequence, availability status, timestamps.
- Unique constraint prevents the same Drive file from being imported twice for one user.

### `chapters`

- Normalized chapter navigation across M4B chapter markers and multi-file books.
- Fields: audiobook ID, audiobook-file ID, title, sequence, start milliseconds, end milliseconds.

### `playback_progress`

- One current checkpoint per user and audiobook.
- Fields: file/chapter reference, position milliseconds, playback rate, completed flag, monotonic client timestamp/version, updated timestamp.
- Updates use an upsert and conflict policy so an old device cannot silently overwrite a newer checkpoint.

### `bookmarks`

- User-created positions with an optional note.
- Fields: audiobook ID, file/chapter reference, position milliseconds, note, timestamps.

### `user_preferences`

- Default playback rate, skip interval, theme choice, and sleep-timer preference.
- No credentials or server data are copied into browser-persisted Zustand state.

Device download records remain local in the MVP. Server-side device inventory is deferred until there is a concrete cross-device management need.

## 11. Google OAuth and Drive Design

### MVP permission model

- Use Supabase Auth only for Google identity scopes (`openid`, email, and profile).
- Start a separate Next.js server authorization flow when the user chooses to connect Drive.
- Use Google Picker and request `drive.file` access.
- Explain permission in context immediately before opening Google's consent surface.
- Validate every selected file ID server-side; never trust Picker output by itself.
- Confirm the authenticated user can download the selected file before importing it.
- Provide explicit disconnect and account-deletion actions.

### Token handling

- Use authorization code flow with PKCE, exact redirect URIs, and CSRF-protected state.
- Request offline access only when needed for persistent playback/import.
- Store the refresh token encrypted at rest using authenticated encryption.
- Keep short-lived access tokens server-side and refresh them as needed.
- Never log authorization codes, access tokens, refresh tokens, session cookies, or Picker payloads containing sensitive metadata.
- Handle refresh-token absence, rotation/updates from Google, invalid grants, revocation, and reconnection.

### Future broader access

Folder-wide automatic scanning may require broader Drive scopes and Google verification. It is a separate product and compliance decision, not an unplanned MVP expansion.

## 12. Streaming Design

The browser cannot reliably attach a Google authorization header through a plain `<audio src>` request. Quiet Library therefore exposes an authenticated server stream endpoint.

The stream handler must:

1. Authenticate the Quiet Library session.
2. Resolve the owned audiobook file without accepting arbitrary Drive IDs.
3. Refresh the Google access token server-side when necessary.
4. Validate and forward a single bounded `Range` request to Drive.
5. Preserve correct `206`, `Content-Range`, `Accept-Ranges`, `Content-Length`, and content type headers.
6. Stream bytes without buffering the entire audiobook in server memory.
7. Apply timeouts, abort propagation, rate limits, and safe upstream error mapping.
8. Never cache personalized audio at a shared CDN or public URL.

The infrastructure must be checked for response-streaming support and bandwidth limits before production hosting is selected.

## 13. Playback and Progress Rules

- One `HTMLAudioElement` instance is controlled by a focused player service/store.
- Use Media Session metadata and actions when supported.
- Default skip interval: 15 seconds; user preference may change it later.
- Playback rate range and steps are named constants.
- Save progress after a meaningful interval, on pause, chapter/file transition, visibility change, and before unload when feasible.
- Avoid a network write on every `timeupdate` event.
- Mark complete only near the end using an explicit threshold.
- Continue across multi-file books without resetting the logical book position.
- Sleep timer supports a duration and “end of chapter”; it is device-local state.

## 14. PWA and Offline Strategy

### Installable shell

- Add a typed Next.js manifest with standalone display, theme colors, icons, and shortcuts where useful.
- Add a deliberately scoped service worker.
- Cache only versioned static app assets and safe public landing assets by default.
- Provide a branded offline route and update-available prompt.
- Do not blindly cache authenticated API responses or Range responses.

### Offline audio

- Detect storage capability instead of assuming it.
- Show required bytes, available estimate, progress, cancellation, and failure recovery.
- Prefer OPFS for large completed files where supported; validate a fallback during the phase.
- Write to a temporary local record and promote it only after a complete verified download.
- Remove partial downloads after cancellation or failure.
- Let users delete individual downloads and clear all local downloads.
- Treat browser eviction as possible and reconcile missing local files gracefully.

## 15. Design System Foundation

The first UI implementation creates one token source in the Tailwind 4 `@theme` block before feature styling.

Token groups:

- Warm paper, elevated paper, ink, muted text, amber action, success, warning, danger, border, and focus colors.
- Editorial display and interface body font families through `next/font`.
- Type scale, spacing scale, content widths, radii, shadows, breakpoints, z-index layers, and motion durations.
- Semantic tokens for player, navigation, progress, offline, and focus states.
- Light theme first; dark mode is supported from the foundation but does not override the approved visual direction.

No raw hex colors or arbitrary spacing values belong in components when a token can represent them.

## 16. Security and Privacy Requirements

- HTTPS in staging and production.
- Secure, HttpOnly, SameSite session cookies.
- Server-side authentication and ownership checks on every protected action/handler.
- CSRF protection for cookie-authenticated state changes.
- Zod validation for environment variables, user input, Drive responses, and stored JSON shapes.
- Strict CSP, HSTS, `nosniff`, frame protection, referrer policy, and a restrictive permissions policy.
- Explicit CORS policy; no wildcard credentialed origins.
- Rate limits for auth, import, progress, metadata edits, and streaming.
- Request size limits and upstream timeouts.
- Structured logs with request IDs and redaction.
- No audio metadata, filenames, tokens, or email addresses in analytics events by default.
- Account deletion removes Quiet Library metadata and revokes stored Google credentials; it does not delete Drive files.
- Privacy copy must accurately distinguish server metadata from device-local downloads.
- Enable RLS on every exposed table and test that User A cannot access User B's rows.
- Keep privileged functions and Drive credentials in private, unexposed schemas.
- Never use Supabase `user_metadata` for authorization decisions.
- Do not use Supabase Edge Functions or Storage as the audiobook streaming path.

## 17. Implementation Phases

Each phase ends in a working checkpoint. Tests are planned as explicit verification slices rather than silently bundled into unrelated feature work.

### Phase 0 — Project foundation (completed 2026-07-15)

- Initialize Git only after user authorization if it is still absent.
- Scaffold Next.js App Router with TypeScript and `src/` layout.
- Initialize the local Supabase CLI layout without linking or provisioning a remote project.
- Pin the package manager and exact dependency versions.
- Configure strict TypeScript, linting, formatting, environment validation, and scripts.
- Create `README.md`, `.env.example`, design token file, route groups, and initial CI plan.
- Add a basic `/health` handler.

Exit gate: passed with a clean install, formatting check, lint, strict typecheck, production build, dependency audit, and live `/health` response.

### Phase 1 — Responsive visual shell (completed 2026-07-15)

- Implement design tokens and shared primitives.
- Build the landing page from the approved mockup.
- Build authenticated desktop/mobile app shells with realistic mock data.
- Build home, library, book, expanded player, offline, settings, and required state components.
- Add accessibility semantics, focus order, keyboard support, reduced motion, and responsive validation.

Exit gate: approved visual fidelity at desktop and mobile widths with no backend dependency.

Implementation checkpoint: the landing, home, library, detail/player, offline,
settings, onboarding, import, legal, and fallback routes pass rendered audits at
390x844 and 1440x900 with no horizontal overflow. Search, progress/download/
finished filters, mobile account navigation, keyboard skip-link behavior,
responsive headings, reduced motion, theme selection, metadata editing, and
account-backed playback preferences are implemented and component-tested.

### Phase 2 — Database and authentication

- Add Supabase SQL migrations, generated database types, explicit grants, indexes, and RLS policies.
- Configure Supabase Auth Google sign-in and SSR session handling with identity scopes only.
- Add the separate Next.js Drive authorization-code flow with PKCE and validated state.
- Implement encrypted Drive credential storage and reconnect/revoke behavior.
- Add authenticated route protection and per-resource ownership enforcement.

Exit gate: sign-in, session restoration, sign-out, revocation, and unauthorized-access checks work locally.

### Phase 3 — Drive Picker and import

- Load Picker only after an explicit user action.
- Validate selected IDs and Drive metadata server-side.
- Detect supported files and reject unsupported/undownloadable items clearly.
- Extract available metadata and chapters without holding full large files in memory.
- Implement grouping review, duplicate detection, user correction, and transactional import.

Exit gate: selected Drive files produce a correct, editable library without modifying the source files.

### Phase 4 — Streaming and player

- Implement the Range-aware authenticated stream handler.
- Implement the single audio element, playback controls, chapters, multi-file transitions, rate, volume, Media Session, and sleep timer.
- Add upstream timeout, cancellation, missing-file, and expired-access recovery.

Exit gate: long files start quickly, seek correctly, transition chapters/files, and do not buffer completely on the server.

### Phase 5 — Progress, bookmarks, and synchronization

- Implement checkpoint upsert and stale-write conflict handling.
- Restore progress on reload and another signed-in device.
- Add bookmarks and completion behavior.
- Add resilient local queuing for checkpoints created during short network interruptions.

Exit gate: playback resumes consistently without older checkpoints overwriting newer progress.

### Phase 6 — PWA and offline playback (implementation completed 2026-07-15)

- Add manifest, icons, service worker, install UX, safe app-shell caching, and offline route.
- Implement capability/storage checks and device-local audio downloads.
- Play downloaded files without Drive or network access.
- Reconcile eviction, partial files, source updates, and manual deletion.

Exit gate: the app installs and a completed download plays in airplane/offline conditions on supported browsers.

Implementation checkpoint: manifest, code-native icons, install/update UX,
safe service-worker caching, a public offline shell, authenticated full-file
downloads, OPFS with Cache Storage fallback, Dexie metadata, storage/quota
feedback, partial/eviction/source-version reconciliation, manual removal, and
offline multi-file playback are implemented. The automated gate and production
HTTP smoke tests pass; the install and airplane-mode portions of the exit gate
remain pending until a supported browser and real imported Drive audio are
available.

### Phase 7 — Hardening and release readiness (local implementation completed 2026-07-15)

- Run accessibility, responsive, performance, and security reviews.
- Add privacy and terms content, account deletion, token revocation, and retention behavior.
- Add structured monitoring, redaction checks, rate limiting, and incident-safe errors.
- Test deployment streaming limits and database migrations in staging.
- Prepare Google OAuth branding/verification materials if required.

Exit gate: staging smoke tests pass and production prerequisites are documented.

Implementation checkpoint: account deletion with revoke-before-cascade,
same-origin mutation enforcement, private atomic Postgres quotas, CSP/HSTS and
cross-origin headers, allowlisted structured events with redaction tests,
expanded legal content, automated component accessibility checks, versioned
library/detail/correction APIs, CI tests on pull requests and `main`, security
policy, deployment checklist, incident operations, and Google OAuth verification
materials are implemented. Local verification can close after the production
build and HTTP security smoke pass; the staging, provider, device, and hosting
portions of the exit gate remain external release blockers.

## 18. Test Plan

### Unit tests

- Metadata normalization and grouping.
- Chapter mapping and logical position calculations.
- Progress conflict policy and completion threshold.
- Range parsing/validation.
- Sleep timer behavior.
- Validation schemas and safe error mapping.

### Integration tests

- Database access, SQL functions, migrations, and RLS against local Supabase Postgres.
- OAuth callback state/PKCE and token-storage boundaries with Google mocked at HTTP level.
- Import success, partial failure, duplicate handling, and ownership isolation.
- Stream endpoint success, Range behavior, invalid ranges, missing files, expired grant, timeout, and User A/User B isolation.
- Progress and bookmark API contracts including validation and auth failures.

### Component tests

- Landing and onboarding actions.
- Player controls and keyboard behavior.
- Loading, empty, error, reconnect, unsupported-format, and insufficient-storage states.
- Mobile navigation and expanded-player transitions.

### End-to-end tests

- Signed-out landing to mocked Google connection and first import.
- Returning user resumes an audiobook.
- Playback position survives reload.
- Revoked Drive connection preserves metadata/progress and offers reconnection.
- Downloaded book plays while the browser is offline.
- Installability and service-worker update smoke checks.

Automated tests do not use real production Google accounts or production data.

## 19. Operational and Deployment Requirements

- Separate development, staging, and production configuration and credentials.
- Managed secrets for Supabase server credentials, Google client credentials, and token-encryption keys; only the Supabase publishable key is public.
- Supabase Postgres with connection strategy appropriate to the Next.js runtime.
- Streaming-compatible hosting with documented request-duration, egress, and concurrency limits.
- CI stages: install, lint, typecheck, unit/integration tests, migration-from-zero check, build, dependency audit, then staging deployment.
- Production deployment only after staging verification and approval.
- Supabase CLI migrations are reviewed, checked with database advisors, and applied before new application traffic.
- Logs and metrics track request duration, Drive errors, stream failures, import outcomes, and auth failures without sensitive payloads.

## 20. Decisions Deferred Until Their Phase

- Final Next.js hosting provider and production Supabase plan/region.
- Metadata parser after testing M4B/MP3 chapter and memory behavior.
- Final app name, domain, logo, icons, and font licenses.
- Whether broader Drive folder scanning is worth restricted-scope verification.
- Whether streaming egress economics require a different architecture after real measurements.

## 21. Next Implementation Slice

The planned local implementation is complete. The next slice is release
validation against real infrastructure:

1. Select the Node hosting provider, production domain, Supabase plan/region,
   log retention, and backup retention.
2. Apply migrations in staging, generate database types, and run every pgTAP/RLS
   test from a clean database.
3. Configure Google identity, Drive OAuth, and Picker clients; verify all live
   provider flows using disposable test data.
4. Run the deployment checklist with representative long files and two
   authenticated sessions.
5. Reconfirm the already-passing desktop/mobile visual audit on representative
   devices, then prove PWA install, update, eviction, and airplane-mode playback
   with a real imported book.
6. Promote the exact validated commit and migration set only after every release
   gate is recorded as passing.
