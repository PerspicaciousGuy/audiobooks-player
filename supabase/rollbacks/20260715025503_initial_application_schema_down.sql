drop trigger if exists auth_user_created on auth.users;

drop table if exists public.drive_connections;
drop table if exists public.user_preferences;
drop table if exists public.bookmarks;
drop table if exists public.playback_progress;
drop table if exists public.chapters;
drop table if exists public.audiobook_files;
drop table if exists public.audiobooks;
drop table if exists public.profiles;

drop function if exists private.handle_new_user();
drop function if exists private.set_updated_at();
drop schema if exists private;
