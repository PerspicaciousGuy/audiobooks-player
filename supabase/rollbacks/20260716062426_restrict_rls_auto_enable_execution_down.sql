do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'grant execute on function public.rls_auto_enable() to public, anon, authenticated';
  end if;
end;
$$;
