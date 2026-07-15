create function public.import_audiobook_groups(
  p_user_id uuid,
  p_groups jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  group_record jsonb;
  file_record jsonb;
  chapter_record jsonb;
  audiobook_id uuid;
  audiobook_file_id uuid;
  chapter_sequence integer;
  imported_ids jsonb := '[]'::jsonb;
begin
  if jsonb_typeof(p_groups) <> 'array'
    or jsonb_array_length(p_groups) = 0
    or jsonb_array_length(p_groups) > 25 then
    raise exception 'invalid_import_groups' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_groups) as selected_group
    cross join lateral jsonb_array_elements(selected_group -> 'files') as selected_file
    join public.audiobook_files as existing_file
      on existing_file.user_id = p_user_id
      and existing_file.drive_file_id = selected_file ->> 'driveFileId'
  ) then
    raise exception 'duplicate_drive_file' using errcode = '23505';
  end if;

  for group_record in select value from jsonb_array_elements(p_groups)
  loop
    if jsonb_typeof(group_record -> 'files') <> 'array'
      or jsonb_array_length(group_record -> 'files') = 0
      or nullif(trim(group_record ->> 'title'), '') is null then
      raise exception 'invalid_import_group' using errcode = '22023';
    end if;

    insert into public.audiobooks (
      user_id,
      title,
      author,
      narrator,
      series,
      series_position,
      import_status
    ) values (
      p_user_id,
      trim(group_record ->> 'title'),
      nullif(trim(group_record ->> 'author'), ''),
      nullif(trim(group_record ->> 'narrator'), ''),
      nullif(trim(group_record ->> 'series'), ''),
      nullif(group_record ->> 'seriesPosition', '')::numeric,
      'ready'
    )
    returning id into audiobook_id;

    chapter_sequence := 0;

    for file_record in
      select value
      from jsonb_array_elements(group_record -> 'files') with ordinality
      order by ordinality
    loop
      insert into public.audiobook_files (
        user_id,
        audiobook_id,
        drive_file_id,
        file_name,
        mime_type,
        byte_size,
        md5_checksum,
        drive_version,
        sequence
      ) values (
        p_user_id,
        audiobook_id,
        file_record ->> 'driveFileId',
        file_record ->> 'name',
        file_record ->> 'mimeType',
        (file_record ->> 'byteSize')::bigint,
        nullif(file_record ->> 'md5Checksum', ''),
        nullif(file_record ->> 'driveVersion', ''),
        coalesce((file_record ->> 'sequence')::integer, 0)
      )
      returning id into audiobook_file_id;

      if jsonb_typeof(file_record #> '{detected,chapters}') = 'array' then
        for chapter_record in
          select value
          from jsonb_array_elements(file_record #> '{detected,chapters}')
        loop
          insert into public.chapters (
            user_id,
            audiobook_id,
            audiobook_file_id,
            title,
            sequence,
            start_ms,
            end_ms
          ) values (
            p_user_id,
            audiobook_id,
            audiobook_file_id,
            coalesce(nullif(trim(chapter_record ->> 'title'), ''), 'Chapter'),
            chapter_sequence,
            (chapter_record ->> 'startMs')::bigint,
            (chapter_record ->> 'endMs')::bigint
          );
          chapter_sequence := chapter_sequence + 1;
        end loop;
      end if;
    end loop;

    imported_ids := imported_ids || jsonb_build_array(audiobook_id);
  end loop;

  return imported_ids;
end;
$$;

revoke all on function public.import_audiobook_groups(uuid, jsonb)
from public, anon, authenticated;
grant execute on function public.import_audiobook_groups(uuid, jsonb)
to service_role;
