alter table public.drive_connections
  add column selected_folder_id text,
  add column selected_folder_name text,
  add constraint drive_connections_selected_folder_id_length_check check (
    selected_folder_id is null
    or char_length(selected_folder_id) between 1 and 255
  ),
  add constraint drive_connections_selected_folder_name_check check (
    selected_folder_name is null
    or selected_folder_name = 'Audiobooks'
  ),
  add constraint drive_connections_selected_folder_pair_check check (
    (selected_folder_id is null) = (selected_folder_name is null)
  );
