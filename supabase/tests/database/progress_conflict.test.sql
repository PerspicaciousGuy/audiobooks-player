begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-4000-8000-000000000004',
  'authenticated',
  'authenticated',
  'progress@example.com',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.audiobooks (id, user_id, title)
values (
  '41000000-0000-4000-8000-000000000004',
  '40000000-0000-4000-8000-000000000004',
  'Progress Book'
);

insert into public.audiobook_files (
  id,
  user_id,
  audiobook_id,
  drive_file_id,
  file_name,
  mime_type,
  byte_size
) values (
  '42000000-0000-4000-8000-000000000004',
  '40000000-0000-4000-8000-000000000004',
  '41000000-0000-4000-8000-000000000004',
  'progress-drive-file',
  'progress.mp3',
  'audio/mpeg',
  1024
);

select has_function(
  'public',
  'save_playback_progress',
  array['uuid', 'uuid', 'uuid', 'bigint', 'numeric', 'boolean', 'timestamp with time zone', 'bigint'],
  'atomic progress function exists'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.save_playback_progress(uuid, uuid, uuid, bigint, numeric, boolean, timestamptz, bigint)',
    'execute'
  ),
  'authenticated callers can save progress'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"40000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select is(
  (public.save_playback_progress(
    '41000000-0000-4000-8000-000000000004',
    '42000000-0000-4000-8000-000000000004',
    null,
    10000,
    1,
    false,
    '2026-07-15T10:00:00Z',
    null
  ) ->> 'version')::bigint,
  1::bigint,
  'the first checkpoint starts at version one'
);

select is(
  (public.save_playback_progress(
    '41000000-0000-4000-8000-000000000004',
    '42000000-0000-4000-8000-000000000004',
    null,
    20000,
    1.25,
    false,
    '2026-07-15T10:01:00Z',
    1
  ) ->> 'version')::bigint,
  2::bigint,
  'a newer expected version is accepted atomically'
);

select is(
  (public.save_playback_progress(
    '41000000-0000-4000-8000-000000000004',
    '42000000-0000-4000-8000-000000000004',
    null,
    5000,
    1,
    false,
    '2026-07-15T09:59:00Z',
    2
  ) ->> 'accepted')::boolean,
  false,
  'an older client timestamp is rejected'
);

select is(
  (public.save_playback_progress(
    '41000000-0000-4000-8000-000000000004',
    '42000000-0000-4000-8000-000000000004',
    null,
    30000,
    1,
    false,
    '2026-07-15T10:02:00Z',
    1
  ) ->> 'accepted')::boolean,
  false,
  'a stale expected version is rejected'
);

select is(
  (select position_ms from public.playback_progress),
  20000::bigint,
  'rejected checkpoints do not overwrite accepted progress'
);

select is(
  (select count(*) from public.playback_progress),
  1::bigint,
  'one checkpoint exists per user and audiobook'
);

select * from finish();

rollback;
