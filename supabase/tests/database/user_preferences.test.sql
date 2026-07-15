begin;

create extension if not exists pgtap with schema extensions;

select plan(5);

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
    'preferences-a@example.com',
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
    'preferences-b@example.com',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select is(
  (select count(*) from public.user_preferences),
  1::bigint,
  'users see only their own preferences'
);

select lives_ok(
  $$
    update public.user_preferences
    set
      default_playback_rate = 1.5,
      default_sleep_timer_minutes = 30,
      skip_back_seconds = 10,
      skip_forward_seconds = 45,
      theme = 'dark'
    where user_id = '10000000-0000-0000-0000-000000000001'
  $$,
  'users can update their own bounded preferences'
);

select is(
  (select theme from public.user_preferences),
  'dark',
  'the owned theme update is visible'
);

select lives_ok(
  $$
    update public.user_preferences
    set theme = 'dark'
    where user_id = '20000000-0000-0000-0000-000000000002'
  $$,
  'an update targeting another user does not expose an authorization oracle'
);

reset role;

select is(
  (
    select theme
    from public.user_preferences
    where user_id = '20000000-0000-0000-0000-000000000002'
  ),
  'system',
  'RLS prevented the cross-user preference update'
);

select * from finish();

rollback;
