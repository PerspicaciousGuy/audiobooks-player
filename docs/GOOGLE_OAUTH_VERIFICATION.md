# Google OAuth and Picker Release Checklist

## Cloud Project

Configure the OAuth consent screen with the production product name, verified
homepage, privacy-policy URL, terms URL, and an operator-controlled support
contact. Verify the application domain and keep the public pages available
without sign-in.

Enable the Google Drive API and Google Picker API. Restrict the browser Picker
API key by production web origin and API. Never expose the Drive OAuth client
secret. Configure the numeric Google Cloud project number as the Picker App ID;
Google requires it when using the `drive.file` scope.

## Separate Grants

Supabase Google identity requests only `openid email profile`. Quiet Library's
server-owned authorization-code flow separately requests
`https://www.googleapis.com/auth/drive.file` with PKCE, user-bound expiring
state, offline access, and exact redirect-URI matching.

The `drive.file` scope limits the app to files and folders the user opens or
selects for the app. The user explicitly selects one folder named `Audiobooks`;
Quiet Library stores its immutable folder ID and opens Picker there. The user
then selects each audiobook file the app may access. Preview and confirmed
import both verify that every file is directly inside that folder. The app never
searches the rest of Drive and never modifies or deletes source audio.

## Verification Evidence

Prepare a short unedited recording that shows:

1. Google identity sign-in.
2. The separate Drive connection action and consent screen.
3. Picker selection of a folder named `Audiobooks` initiated by the user.
4. An explicitly selected audio file appearing in review and playing successfully.
5. Drive disconnection and confirmed revocation.
6. Account deletion while the original Drive file remains intact.

Submit only the minimum scopes used by the reviewed build. Keep staging test
users listed while the consent screen is in testing mode. Re-check authorized
origins and redirect URIs whenever the canonical domain changes.
