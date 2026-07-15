# Google OAuth and Picker Release Checklist

## Cloud Project

Configure the OAuth consent screen with the production product name, verified
homepage, privacy-policy URL, terms URL, and an operator-controlled support
contact. Verify the application domain and keep the public pages available
without sign-in.

Enable the Google Drive API and Google Picker API. Restrict the browser Picker
API key by production web origin and API. Never expose the Drive OAuth client
secret.

## Separate Grants

Supabase Google identity requests only `openid email profile`. Quiet Library's
server-owned authorization-code flow separately requests
`https://www.googleapis.com/auth/drive.file` with PKCE, user-bound expiring
state, offline access, and exact redirect-URI matching.

The `drive.file` scope limits the app to files the user opens or selects for the
app. Product copy and the verification video should show that selection is
explicit and that Quiet Library never modifies or deletes source audio.

## Verification Evidence

Prepare a short unedited recording that shows:

1. Google identity sign-in.
2. The separate Drive connection action and consent screen.
3. Picker selection initiated by the user.
4. Playback of the selected file.
5. Drive disconnection and confirmed revocation.
6. Account deletion while the original Drive file remains intact.

Submit only the minimum scopes used by the reviewed build. Keep staging test
users listed while the consent screen is in testing mode. Re-check authorized
origins and redirect URIs whenever the canonical domain changes.
