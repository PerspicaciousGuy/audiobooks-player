alter table public.audiobook_files
  add constraint audiobook_files_id_book_user_key
  unique (id, audiobook_id, user_id);

alter table public.chapters
  add constraint chapters_id_book_user_key
  unique (id, audiobook_id, user_id);

alter table public.playback_progress
  drop constraint playback_progress_audiobook_file_id_user_id_fkey,
  drop constraint playback_progress_chapter_id_user_id_fkey,
  add constraint playback_progress_file_book_user_fkey
    foreign key (audiobook_file_id, audiobook_id, user_id)
    references public.audiobook_files (id, audiobook_id, user_id)
    on delete set null (audiobook_file_id),
  add constraint playback_progress_chapter_book_user_fkey
    foreign key (chapter_id, audiobook_id, user_id)
    references public.chapters (id, audiobook_id, user_id)
    on delete set null (chapter_id);

alter table public.bookmarks
  drop constraint bookmarks_audiobook_file_id_user_id_fkey,
  drop constraint bookmarks_chapter_id_user_id_fkey,
  add constraint bookmarks_file_book_user_fkey
    foreign key (audiobook_file_id, audiobook_id, user_id)
    references public.audiobook_files (id, audiobook_id, user_id)
    on delete set null (audiobook_file_id),
  add constraint bookmarks_chapter_book_user_fkey
    foreign key (chapter_id, audiobook_id, user_id)
    references public.chapters (id, audiobook_id, user_id)
    on delete set null (chapter_id);

create function public.save_playback_progress(
  p_audiobook_id uuid,
  p_audiobook_file_id uuid,
  p_chapter_id uuid,
  p_position_ms bigint,
  p_playback_rate numeric,
  p_is_completed boolean,
  p_client_updated_at timestamptz,
  p_expected_version bigint default null
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  result jsonb;
begin
  if current_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  insert into public.playback_progress (
    user_id,
    audiobook_id,
    audiobook_file_id,
    chapter_id,
    position_ms,
    playback_rate,
    is_completed,
    client_updated_at,
    version
  ) values (
    current_user_id,
    p_audiobook_id,
    p_audiobook_file_id,
    p_chapter_id,
    p_position_ms,
    p_playback_rate,
    p_is_completed,
    p_client_updated_at,
    1
  )
  on conflict (user_id, audiobook_id) do update set
    audiobook_file_id = excluded.audiobook_file_id,
    chapter_id = excluded.chapter_id,
    position_ms = excluded.position_ms,
    playback_rate = excluded.playback_rate,
    is_completed = excluded.is_completed,
    client_updated_at = excluded.client_updated_at,
    version = public.playback_progress.version + 1
  where public.playback_progress.client_updated_at < excluded.client_updated_at
    and (
      p_expected_version is null
      or public.playback_progress.version = p_expected_version
    )
  returning jsonb_build_object(
    'accepted', true,
    'audiobookFileId', audiobook_file_id,
    'chapterId', chapter_id,
    'clientUpdatedAt', client_updated_at,
    'isCompleted', is_completed,
    'playbackRate', playback_rate,
    'positionMs', position_ms,
    'version', version
  ) into result;

  if result is null then
    select jsonb_build_object(
      'accepted', false,
      'audiobookFileId', audiobook_file_id,
      'chapterId', chapter_id,
      'clientUpdatedAt', client_updated_at,
      'isCompleted', is_completed,
      'playbackRate', playback_rate,
      'positionMs', position_ms,
      'version', version
    )
    into result
    from public.playback_progress
    where user_id = current_user_id
      and audiobook_id = p_audiobook_id;
  end if;

  return result;
end;
$$;

revoke all on function public.save_playback_progress(
  uuid, uuid, uuid, bigint, numeric, boolean, timestamptz, bigint
) from public, anon;
grant execute on function public.save_playback_progress(
  uuid, uuid, uuid, bigint, numeric, boolean, timestamptz, bigint
) to authenticated;
