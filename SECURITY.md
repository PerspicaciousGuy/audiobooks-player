# Security Policy

## Supported Version

Security fixes are applied to the latest commit on `main`. This portfolio
project does not currently maintain older release branches.

## Reporting a Vulnerability

Do not open a public issue containing credentials, tokens, personal data, or a
working exploit. Use the repository's private GitHub vulnerability-reporting
flow under **Security → Advisories → Report a vulnerability**. Include the
affected route, impact, reproduction steps, and any suggested mitigation.

The maintainer should acknowledge a report before discussing disclosure timing.
Never test with another person's Google Drive files or account.

## Security Boundaries

- Supabase authorization is enforced with verified claims, explicit grants,
  foreign-key ownership, and RLS. User metadata is not an authorization source.
- Google identity and Google Drive authorization are separate grants. Drive
  credentials are server-only, encrypted with AES-256-GCM, and revoked before
  their database record is removed.
- Audio responses require an owned database record. Range streams are capped;
  full downloads are explicit and never enter the service-worker cache.
- State-changing APIs require the configured application origin and use
  database-backed per-account quotas.
- Structured operational events accept only allowlisted non-content fields.

See `docs/OPERATIONS.md` for incident handling and `docs/DEPLOYMENT.md` for the
release checklist.
