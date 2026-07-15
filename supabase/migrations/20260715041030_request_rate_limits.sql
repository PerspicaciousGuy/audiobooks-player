create table private.request_rate_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  bucket text not null check (
    bucket in (
      'account_delete',
      'audiobook_read',
      'audiobook_update',
      'bookmark_create',
      'bookmark_delete',
      'download',
      'import_confirm',
      'import_preview',
      'library_read',
      'picker_token',
      'preferences_update',
      'progress',
      'stream'
    )
  ),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (user_id, bucket)
);

alter table private.request_rate_limits enable row level security;

create function public.consume_request_quota(p_bucket text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  quota integer;
  window_seconds integer;
  current_count integer;
  current_window timestamptz;
begin
  if current_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select limits.quota, limits.window_seconds
  into quota, window_seconds
  from (
    values
      ('account_delete', 3, 86400),
      ('audiobook_read', 120, 60),
      ('audiobook_update', 30, 60),
      ('bookmark_create', 60, 60),
      ('bookmark_delete', 60, 60),
      ('download', 30, 3600),
      ('import_confirm', 10, 60),
      ('import_preview', 20, 60),
      ('library_read', 120, 60),
      ('picker_token', 60, 60),
      ('preferences_update', 30, 60),
      ('progress', 180, 60),
      ('stream', 600, 60)
  ) as limits(bucket, quota, window_seconds)
  where limits.bucket = p_bucket;

  if quota is null then
    raise exception 'unknown_rate_limit_bucket' using errcode = '22023';
  end if;

  insert into private.request_rate_limits (
    user_id,
    bucket,
    window_started_at,
    request_count
  ) values (
    current_user_id,
    p_bucket,
    clock_timestamp(),
    1
  )
  on conflict (user_id, bucket) do update set
    window_started_at = case
      when private.request_rate_limits.window_started_at
        <= clock_timestamp() - make_interval(secs => window_seconds)
        then clock_timestamp()
      else private.request_rate_limits.window_started_at
    end,
    request_count = case
      when private.request_rate_limits.window_started_at
        <= clock_timestamp() - make_interval(secs => window_seconds)
        then 1
      else private.request_rate_limits.request_count + 1
    end
  returning request_count, window_started_at
  into current_count, current_window;

  return jsonb_build_object(
    'allowed', current_count <= quota,
    'limit', quota,
    'remaining', greatest(quota - current_count, 0),
    'retryAfterSeconds', case
      when current_count <= quota then 0
      else greatest(
        ceil(extract(epoch from (
          current_window + make_interval(secs => window_seconds) - clock_timestamp()
        )))::integer,
        1
      )
    end
  );
end;
$$;

revoke all on table private.request_rate_limits from public, anon, authenticated;
revoke all on function public.consume_request_quota(text) from public, anon;
grant execute on function public.consume_request_quota(text) to authenticated;
