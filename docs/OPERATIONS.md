# Operations and Incident Guide

## Monitoring

The server emits JSON events with an event name, timestamp, operation, outcome,
and HTTP status. The logger intentionally has no fields for user IDs, emails,
tokens, file IDs, filenames, titles, or listening positions. Forward stdout to
the selected hosting monitor and preserve the JSON structure.

Before production, configure alerts for sustained `rate_limit_unavailable`,
account-deletion failures, elevated API `5xx`, Google `401/403`, invalid Range
responses, and download-size mismatches. Select and disclose finite application
log and managed-backup retention periods before launch.

## Incident Response

1. Preserve non-sensitive timestamps, release IDs, and aggregate event counts.
2. Disable the affected integration or deployment without exposing raw request
   headers or bodies.
3. If Drive credentials may be exposed, rotate the OAuth client secret and
   require affected users to revoke Quiet Library in Google Account permissions.
4. If the envelope key may be exposed, rotate it through a planned migration or
   revoke every stored grant; never silently replace it.
5. Patch in staging, run the complete release checklist, then deploy the exact
   reviewed commit.
6. Record scope, impact, remediation, and prevention without placing personal
   audiobook data in the incident report.

## Database Changes and Recovery

Apply migrations forward in order and test the matching script in
`supabase/rollbacks` before production. Take a provider-supported recovery point
before schema changes. A restore can reintroduce records deleted after that
point, so deletion requests must be reconciled before restored data is exposed.

Rate-limit state is private, per account and operation, and cascades when the
Auth user is deleted. If the quota function is unavailable, protected APIs fail
closed with `503` rather than accepting unmetered traffic.

## Routine Release Review

- Run `npm run verify`, `npm audit --omit=dev`, pgTAP, and the staging smoke
  checklist.
- Review dependency, Supabase, Google, and hosting advisories.
- Confirm OAuth branding, public legal pages, domain verification, and secret
  inventory.
- Sample structured events for accidental sensitive content.
- Exercise account deletion and Drive revoke with a disposable test account.
