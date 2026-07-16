begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

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
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'listener-a@example.com',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'listener-b@example.com',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

select is(
  (
    select count(*)
    from public.profiles
    where id in (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002'
    )
  ),
  2::bigint,
  'auth user creation provisions profiles'
);

select is(
  (
    select count(*)
    from public.user_preferences
    where user_id in (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002'
    )
  ),
  2::bigint,
  'auth user creation provisions preferences'
);

insert into public.audiobooks (id, user_id, title)
values
  (
    '11000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Listener A Book'
  ),
  (
    '22000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Listener B Book'
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select is(
  (select count(*) from public.audiobooks),
  1::bigint,
  'authenticated users only see their own audiobooks'
);

select is(
  (select title from public.audiobooks limit 1),
  'Listener A Book',
  'RLS returns the owned audiobook'
);

select lives_ok(
  $$
    insert into public.bookmarks (
      user_id,
      audiobook_id,
      position_ms
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '11000000-0000-0000-0000-000000000001',
      12000
    )
  $$,
  'users can create bookmarks for their own audiobook'
);

select throws_ok(
  $$
    insert into public.bookmarks (
      user_id,
      audiobook_id,
      position_ms
    ) values (
      '20000000-0000-0000-0000-000000000002',
      '22000000-0000-0000-0000-000000000002',
      12000
    )
  $$,
  '42501',
  null,
  'users cannot create bookmarks for another user'
);

reset role;

select ok(
  not has_table_privilege('anon', 'public.audiobooks', 'select'),
  'anonymous callers have no audiobook table grant'
);

select ok(
  has_table_privilege('authenticated', 'public.audiobooks', 'select'),
  'authenticated callers receive the explicit audiobook select grant'
);

select ok(
  not has_schema_privilege('authenticated', 'private', 'usage'),
  'authenticated callers cannot use the private schema'
);

select ok(
  not has_table_privilege('authenticated', 'public.drive_connections', 'select'),
  'authenticated callers have no Drive credential table grant'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.drive_connections'::regclass),
  'RLS is enabled on Drive credentials'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.audiobooks'::regclass),
  'RLS is enabled on audiobooks'
);

select * from finish();

rollback;
