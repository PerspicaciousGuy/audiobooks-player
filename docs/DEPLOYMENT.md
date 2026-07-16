# Deployment Guide

## Required Services

- A Node.js 24 host that supports streaming Web `Response` bodies without
  buffering them and permits long-lived Google Drive requests.
- A hosted Supabase project for Auth and Postgres.
- An HTTPS application origin. Service workers and production OAuth must not be
  released on an insecure public origin.
- A Google Cloud project configured as described in
  `GOOGLE_OAUTH_VERIFICATION.md`.

The deployment is provider-neutral. Validate the selected host's response-size,
duration, concurrency, bandwidth, and egress constraints with representative
long audiobooks before launch.

## Environment Classification

The current Koyeb Free service and Supabase Free project are the portfolio
**staging** environment. They are not approved as production infrastructure.
Koyeb documents Free Instances as preview/hobby capacity that should not be used
for production, and Supabase Free does not include guaranteed automatic
backups. See the current [Koyeb instance limits](https://www.koyeb.com/docs/reference/instances),
[Koyeb retention features](https://www.koyeb.com/pricing), and
[Supabase backup guidance](https://supabase.com/docs/guides/platform/backups).

Production promotion requires a non-Free Koyeb instance (or equivalent Node
host) and Supabase Pro (or equivalent managed Postgres) with at least seven days
of runtime/API/database logs and seven daily database restore points. Keep an
encrypted logical export made before every schema release for 30 days outside
the database provider. The existing free services remain suitable for portfolio
demonstration and staging validation without creating a paid commitment.

## Release Order

1. Create a staging Supabase project and record the rollback point.
2. Apply every migration in `supabase/migrations` in timestamp order.
3. Generate database types from the migrated project; do not hand-label types as
   generated.
4. Run all pgTAP tests in `supabase/tests/database`.
5. Run `npm run supabase:test:recovery` against the disposable staging/local
   stack to apply every rollback in reverse order, reapply all migrations, and
   rerun the database tests. Never run this destructive verifier against a
   shared or production database.
6. Configure the environment values from `.env.example` in the host's secret
   manager. Never copy secrets into browser-visible variables.
7. Deploy the Next.js production build and complete the smoke checklist below.
8. Promote the same reviewed commit and migration set to production.

## Environment

`NEXT_PUBLIC_APP_URL` must be the exact canonical HTTPS origin. Set Supabase
Auth mode, URL, publishable key, and server secret key together. Set Drive mode,
client ID, client secret, Picker API key, and a canonical base64 32-byte token
encryption key together. Restrict the Picker API key to the production origin
and the required Google API.

Rotating `DRIVE_TOKEN_ENCRYPTION_KEY` requires a planned credential-envelope
migration or reconnecting every Drive account. Replacing it without migration
makes stored credentials unreadable.

## Staging Smoke Checklist

- Confirm CSP, HSTS, content-type, frame, referrer, permissions, and
  service-worker headers.
- Verify sign-in, session refresh, sign-out, Drive consent, reconnect, and
  revoke with a test Google account.
- Import supported and rejected files; confirm no source file is modified.
- Seek near the start and end of a large file and confirm exact `206` ranges.
- Exercise multi-file playback, two-session progress conflicts, and bookmarks.
- Install the PWA, download a complete book, enter airplane mode, and play every
  source in sequence. Test partial download cleanup, quota errors, eviction,
  source-version changes, update activation, and manual clearing.
- Delete the test account and verify Drive revocation, Auth deletion, database
  cascades, local storage clearing, and preservation of the original Drive file.
- Review logs to confirm tokens, IDs, email, titles, filenames, and positions are
  absent.

Production release is blocked until all checklist items pass on the selected
host and representative desktop/mobile browsers.
