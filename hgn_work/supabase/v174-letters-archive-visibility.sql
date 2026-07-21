-- HGN v174 - Letters Archive Visibility Fix
-- Makes older/past Letters to the Editor visible again when they were already published/approved.
-- Safe to rerun.

create extension if not exists pgcrypto;

alter table public.letters_to_editor add column if not exists letter text;
alter table public.letters_to_editor add column if not exists message text;
alter table public.letters_to_editor add column if not exists body text;
alter table public.letters_to_editor add column if not exists edited_body text;
alter table public.letters_to_editor add column if not exists edited_subject text;
alter table public.letters_to_editor add column if not exists status text default 'approved';
alter table public.letters_to_editor add column if not exists published_at timestamptz;
alter table public.letters_to_editor add column if not exists community text;
alter table public.letters_to_editor add column if not exists location text;
alter table public.letters_to_editor add column if not exists subject text;
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

-- Backfill text fields so older rows have something displayable.
update public.letters_to_editor
set letter = coalesce(nullif(letter, ''), nullif(edited_body, ''), nullif(body, ''), nullif(message, ''), 'Letter text unavailable.'),
    body = coalesce(nullif(body, ''), nullif(edited_body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.'),
    message = coalesce(nullif(message, ''), nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), 'Letter text unavailable.'),
    edited_body = coalesce(nullif(edited_body, ''), nullif(body, ''), nullif(letter, ''), nullif(message, ''), 'Letter text unavailable.'),
    edited_subject = coalesce(nullif(edited_subject, ''), nullif(subject, ''), 'Letter to the Editor'),
    community = coalesce(nullif(community, ''), nullif(location, ''), 'Community not provided'),
    published_at = coalesce(published_at, updated_at, created_at, now()),
    updated_at = now()
where letter is null
   or letter = ''
   or body is null
   or body = ''
   or message is null
   or message = ''
   or edited_body is null
   or edited_body = ''
   or edited_subject is null
   or edited_subject = ''
   or community is null
   or community = ''
   or published_at is null;

-- Normalize likely public statuses to approved.
update public.letters_to_editor
set status = 'approved',
    published_at = coalesce(published_at, updated_at, created_at, now()),
    updated_at = now()
where lower(coalesce(status, '')) in ('published', 'publish', 'public', 'active', 'live');

-- If old letters had no status but have text, make them approved so archive is visible.
update public.letters_to_editor
set status = 'approved',
    published_at = coalesce(published_at, updated_at, created_at, now()),
    updated_at = now()
where (status is null or status = '')
  and coalesce(nullif(letter, ''), nullif(body, ''), nullif(message, ''), nullif(edited_body, '')) is not null;

alter table public.letters_to_editor enable row level security;

drop policy if exists "letters_public_read_published" on public.letters_to_editor;
drop policy if exists letters_public_read_published on public.letters_to_editor;
create policy "letters_public_read_published"
on public.letters_to_editor
for select
to anon, authenticated
using (
  lower(coalesce(status, '')) in ('approved', 'published', 'public', 'active', 'live')
);

drop policy if exists "letters_authenticated_moderate" on public.letters_to_editor;
drop policy if exists letters_authenticated_moderate on public.letters_to_editor;
create policy "letters_authenticated_moderate"
on public.letters_to_editor
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_letters_to_editor_status_published
on public.letters_to_editor (status, published_at desc, created_at desc);
