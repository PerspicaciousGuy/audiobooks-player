drop function if exists public.save_playback_progress(
  uuid, uuid, uuid, bigint, numeric, boolean, timestamptz, bigint
);

alter table public.bookmarks
  drop constraint bookmarks_chapter_book_user_fkey,
  drop constraint bookmarks_file_book_user_fkey,
  add foreign key (audiobook_file_id, user_id)
    references public.audiobook_files (id, user_id)
    on delete set null (audiobook_file_id),
  add foreign key (chapter_id, user_id)
    references public.chapters (id, user_id)
    on delete set null (chapter_id);

alter table public.playback_progress
  drop constraint playback_progress_chapter_book_user_fkey,
  drop constraint playback_progress_file_book_user_fkey,
  add foreign key (audiobook_file_id, user_id)
    references public.audiobook_files (id, user_id)
    on delete set null (audiobook_file_id),
  add foreign key (chapter_id, user_id)
    references public.chapters (id, user_id)
    on delete set null (chapter_id);

alter table public.chapters
  drop constraint chapters_id_book_user_key;

alter table public.audiobook_files
  drop constraint audiobook_files_id_book_user_key;
