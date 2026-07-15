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
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'rate-a@example.com',
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
    'rate-b@example.com',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

select ok(
  has_table('private', 'request_rate_limits'),
  'private rate-limit state exists'
);

select ok(
  not has_schema_privilege('authenticated', 'private', 'usage'),
  'authenticated callers cannot inspect the private schema'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'private.request_rate_limits',
    'select'
  ),
  'authenticated callers cannot read rate-limit state directly'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.consume_request_quota(text)',
    'execute'
  ),
  'authenticated callers can consume their own quota'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.consume_request_quota(text)',
    'execute'
  ),
  'anonymous callers cannot consume quota'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select ok(
  (public.consume_request_quota('account_delete')->>'allowed')::boolean,
  'a request inside the fixed quota is accepted'
);

do $$
begin
  perform public.consume_request_quota('account_delete');
  perform public.consume_request_quota('account_delete');
end;
$$;

select ok(
  not (public.consume_request_quota('account_delete')->>'allowed')::boolean,
  'a request over quota is rejected'
);

select throws_ok(
  $$ select public.consume_request_quota('unknown') $$,
  '22023',
  'unknown_rate_limit_bucket',
  'unknown buckets cannot bypass fixed server limits'
);

select * from finish();

rollback;
