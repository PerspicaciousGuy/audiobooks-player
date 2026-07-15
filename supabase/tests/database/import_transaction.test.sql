begin;

create extension if not exists pgtap with schema extensions;

select plan(9);

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
) values (
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000003',
  'authenticated',
  'authenticated',
  'importer@example.com',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

select has_function(
  'public',
  'import_audiobook_groups',
  array['uuid', 'jsonb'],
  'transactional import function exists'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.import_audiobook_groups(uuid, jsonb)',
    'execute'
  ),
  'authenticated callers cannot execute the import function'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.import_audiobook_groups(uuid, jsonb)',
    'execute'
  ),
  'the trusted server role can execute the import function'
);

select lives_ok(
  $$
    select public.import_audiobook_groups(
      '30000000-0000-0000-0000-000000000003',
      '[{
        "title": "A Wizard of Earthsea",
        "author": "Ursula K. Le Guin",
        "narrator": "Rob Inglis",
        "series": "Earthsea",
        "seriesPosition": 1,
        "files": [{
          "driveFileId": "drive-file-part-01",
          "name": "Earthsea Part 1.mp3",
          "mimeType": "audio/mpeg",
          "byteSize": "1024",
          "md5Checksum": null,
          "driveVersion": "1",
          "sequence": 0,
          "detected": {
            "chapters": [{
              "title": "Warriors in the Mist",
              "startMs": 0,
              "endMs": 120000
            }]
          }
        }, {
          "driveFileId": "drive-file-part-02",
          "name": "Earthsea Part 2.mp3",
          "mimeType": "audio/mpeg",
          "byteSize": "2048",
          "md5Checksum": null,
          "driveVersion": "1",
          "sequence": 1,
          "detected": {}
        }]
      }]'::jsonb
    )
  $$,
  'a reviewed group imports in one transaction'
);

select is(
  (select count(*) from public.audiobooks),
  1::bigint,
  'one audiobook is created'
);

select is(
  (select count(*) from public.audiobook_files),
  2::bigint,
  'both selected files are created'
);

select is(
  (select count(*) from public.chapters),
  1::bigint,
  'bounded ID3 chapters are persisted'
);

select throws_ok(
  $$
    select public.import_audiobook_groups(
      '30000000-0000-0000-0000-000000000003',
      '[{
        "title": "Duplicate",
        "files": [{
          "driveFileId": "drive-file-part-01",
          "name": "duplicate.mp3",
          "mimeType": "audio/mpeg",
          "byteSize": "1024",
          "sequence": 0,
          "detected": {}
        }]
      }]'::jsonb
    )
  $$,
  '23505',
  null,
  'duplicate Drive files abort the transaction'
);

select is(
  (select count(*) from public.audiobooks),
  1::bigint,
  'a failed duplicate import creates no partial audiobook'
);

select * from finish();

rollback;
