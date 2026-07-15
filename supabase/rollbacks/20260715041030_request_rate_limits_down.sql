revoke all on function public.consume_request_quota(text)
from public, anon, authenticated;

drop function if exists public.consume_request_quota(text);
drop table if exists private.request_rate_limits;
