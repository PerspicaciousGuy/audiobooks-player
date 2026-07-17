alter table public.drive_connections
  drop constraint if exists drive_connections_selected_folder_pair_check,
  drop constraint if exists drive_connections_selected_folder_name_check,
  drop constraint if exists drive_connections_selected_folder_id_length_check,
  drop column if exists selected_folder_name,
  drop column if exists selected_folder_id;
