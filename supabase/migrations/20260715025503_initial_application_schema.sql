create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  avatar_url text check (char_length(avatar_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audiobooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  author text check (char_length(author) <= 300),
  narrator text check (char_length(narrator) <= 300),
  series text check (char_length(series) <= 300),
  series_position numeric(8, 2) check (series_position > 0),
  description text check (char_length(description) <= 10000),
  cover_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(cover_metadata) = 'object'),
  total_duration_ms bigint check (total_duration_ms >= 0),
  import_status text not null default 'ready' check (
    import_status in ('scanning', 'needs_review', 'ready', 'partial', 'failed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.audiobook_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  audiobook_id uuid not null,
  drive_file_id text not null check (char_length(drive_file_id) between 1 and 255),
  file_name text not null check (char_length(file_name) between 1 and 500),
  mime_type text not null check (char_length(mime_type) between 1 and 255),
  byte_size bigint not null check (byte_size > 0),
  md5_checksum text check (md5_checksum ~ '^[a-fA-F0-9]{32}$'),
  drive_version text check (char_length(drive_version) <= 255),
  duration_ms bigint check (duration_ms >= 0),
  sequence integer not null default 0 check (sequence >= 0),
  availability_status text not null default 'available' check (
    availability_status in ('available', 'moved', 'deleted', 'forbidden', 'unsupported')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (audiobook_id, user_id)
    references public.audiobooks (id, user_id) on delete cascade,
  unique (id, user_id),
  unique (user_id, drive_file_id),
  unique (audiobook_id, sequence)
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  audiobook_id uuid not null,
  audiobook_file_id uuid,
  title text not null check (char_length(title) between 1 and 500),
  sequence integer not null check (sequence >= 0),
  start_ms bigint not null check (start_ms >= 0),
  end_ms bigint check (end_ms > start_ms),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (audiobook_id, user_id)
    references public.audiobooks (id, user_id) on delete cascade,
  foreign key (audiobook_file_id, user_id)
    references public.audiobook_files (id, user_id) on delete cascade,
  unique (id, user_id),
  unique (audiobook_id, sequence)
);

create table public.playback_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  audiobook_id uuid not null,
  audiobook_file_id uuid,
  chapter_id uuid,
  position_ms bigint not null default 0 check (position_ms >= 0),
  playback_rate numeric(4, 2) not null default 1 check (playback_rate between 0.5 and 3),
  is_completed boolean not null default false,
  client_updated_at timestamptz not null,
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (audiobook_id, user_id)
    references public.audiobooks (id, user_id) on delete cascade,
  foreign key (audiobook_file_id, user_id)
    references public.audiobook_files (id, user_id)
    on delete set null (audiobook_file_id),
  foreign key (chapter_id, user_id)
    references public.chapters (id, user_id)
    on delete set null (chapter_id),
  unique (user_id, audiobook_id)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  audiobook_id uuid not null,
  audiobook_file_id uuid,
  chapter_id uuid,
  position_ms bigint not null check (position_ms >= 0),
  note text check (char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (audiobook_id, user_id)
    references public.audiobooks (id, user_id) on delete cascade,
  foreign key (audiobook_file_id, user_id)
    references public.audiobook_files (id, user_id)
    on delete set null (audiobook_file_id),
  foreign key (chapter_id, user_id)
    references public.chapters (id, user_id)
    on delete set null (chapter_id)
);

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  default_playback_rate numeric(4, 2) not null default 1 check (
    default_playback_rate between 0.5 and 3
  ),
  skip_forward_seconds smallint not null default 30 check (skip_forward_seconds between 5 and 120),
  skip_back_seconds smallint not null default 15 check (skip_back_seconds between 5 and 120),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  default_sleep_timer_minutes smallint check (
    default_sleep_timer_minutes is null
    or default_sleep_timer_minutes between 5 and 180
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.drive_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  google_subject text not null check (char_length(google_subject) between 1 and 255),
  granted_scopes text[] not null check (cardinality(granted_scopes) > 0),
  encrypted_token_envelope jsonb not null check (jsonb_typeof(encrypted_token_envelope) = 'object'),
  access_token_expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked', 'error')),
  last_validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index audiobooks_user_updated_idx
  on public.audiobooks (user_id, updated_at desc);
create index audiobook_files_user_book_sequence_idx
  on public.audiobook_files (user_id, audiobook_id, sequence);
create index chapters_user_book_sequence_idx
  on public.chapters (user_id, audiobook_id, sequence);
create index playback_progress_user_updated_idx
  on public.playback_progress (user_id, updated_at desc);
create index bookmarks_user_book_position_idx
  on public.bookmarks (user_id, audiobook_id, position_ms);
create index drive_connections_user_status_idx
  on public.drive_connections (user_id, status);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();
create trigger audiobooks_set_updated_at
before update on public.audiobooks
for each row execute function private.set_updated_at();
create trigger audiobook_files_set_updated_at
before update on public.audiobook_files
for each row execute function private.set_updated_at();
create trigger chapters_set_updated_at
before update on public.chapters
for each row execute function private.set_updated_at();
create trigger playback_progress_set_updated_at
before update on public.playback_progress
for each row execute function private.set_updated_at();
create trigger bookmarks_set_updated_at
before update on public.bookmarks
for each row execute function private.set_updated_at();
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function private.set_updated_at();
create trigger drive_connections_set_updated_at
before update on public.drive_connections
for each row execute function private.set_updated_at();
create trigger auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.audiobooks enable row level security;
alter table public.audiobook_files enable row level security;
alter table public.chapters enable row level security;
alter table public.playback_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.user_preferences enable row level security;
alter table public.drive_connections enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy audiobooks_select_own on public.audiobooks
for select to authenticated using ((select auth.uid()) = user_id);
create policy audiobooks_update_own on public.audiobooks
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy audiobook_files_select_own on public.audiobook_files
for select to authenticated using ((select auth.uid()) = user_id);
create policy chapters_select_own on public.chapters
for select to authenticated using ((select auth.uid()) = user_id);

create policy playback_progress_select_own on public.playback_progress
for select to authenticated using ((select auth.uid()) = user_id);
create policy playback_progress_insert_own on public.playback_progress
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy playback_progress_update_own on public.playback_progress
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy bookmarks_select_own on public.bookmarks
for select to authenticated using ((select auth.uid()) = user_id);
create policy bookmarks_insert_own on public.bookmarks
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy bookmarks_update_own on public.bookmarks
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy bookmarks_delete_own on public.bookmarks
for delete to authenticated using ((select auth.uid()) = user_id);

create policy user_preferences_select_own on public.user_preferences
for select to authenticated using ((select auth.uid()) = user_id);
create policy user_preferences_insert_own on public.user_preferences
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy user_preferences_update_own on public.user_preferences
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.audiobooks from anon, authenticated;
revoke all on table public.audiobook_files from anon, authenticated;
revoke all on table public.chapters from anon, authenticated;
revoke all on table public.playback_progress from anon, authenticated;
revoke all on table public.bookmarks from anon, authenticated;
revoke all on table public.user_preferences from anon, authenticated;
revoke all on table public.drive_connections from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;

grant usage on schema public to authenticated;
grant select, update on table public.profiles to authenticated;
grant select, update on table public.audiobooks to authenticated;
grant select on table public.audiobook_files to authenticated;
grant select on table public.chapters to authenticated;
grant select, insert, update on table public.playback_progress to authenticated;
grant select, insert, update, delete on table public.bookmarks to authenticated;
grant select, insert, update on table public.user_preferences to authenticated;
