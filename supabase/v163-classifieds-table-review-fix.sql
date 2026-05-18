-- HGN v163 - Classifieds Table Review Fix
-- The marketplace form writes to public.classifieds.
-- This migration makes that exact table insertable/reviewable and adds it to admin review.

create extension if not exists pgcrypto;

create table if not exists public.classifieds (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text,
  location text,
  description text,
  price text,
  contact_name text,
  contact_email text,
  phone text,
  image_url text,
  status text not null default 'pending',
  is_featured boolean default false,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classifieds add column if not exists title text;
alter table public.classifieds add column if not exists category text;
alter table public.classifieds add column if not exists location text;
alter table public.classifieds add column if not exists description text;
alter table public.classifieds add column if not exists price text;
alter table public.classifieds add column if not exists contact_name text;
alter table public.classifieds add column if not exists contact_email text;
alter table public.classifieds add column if not exists phone text;
alter table public.classifieds add column if not exists image_url text;
alter table public.classifieds add column if not exists status text default 'pending';
alter table public.classifieds add column if not exists is_featured boolean default false;
alter table public.classifieds add column if not exists admin_notes text;
alter table public.classifieds add column if not exists created_at timestamptz default now();
alter table public.classifieds add column if not exists updated_at timestamptz default now();

alter table public.classifieds enable row level security;

drop policy if exists public_insert_classifieds on public.classifieds;
create policy public_insert_classifieds on public.classifieds
for insert to anon, authenticated with check (true);

drop policy if exists public_read_approved_classifieds on public.classifieds;
create policy public_read_approved_classifieds on public.classifieds
for select to anon, authenticated
using (status = 'approved');

drop policy if exists authenticated_review_classifieds on public.classifieds;
create policy authenticated_review_classifieds on public.classifieds
for all to authenticated
using (true)
with check (true);

create index if not exists idx_classifieds_status_created
on public.classifieds (status, created_at desc);

-- Optional mirror seed into submission_inbox for old classifieds that are not already mirrored.
create table if not exists public.submission_inbox (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null,
  title text,
  sender_name text,
  sender_email text,
  sender_phone text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  priority text not null default 'normal',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.submission_inbox (
  submission_type,
  title,
  sender_name,
  sender_email,
  sender_phone,
  message,
  payload,
  status,
  priority,
  created_at,
  updated_at
)
select
  'classified',
  c.title,
  c.contact_name,
  c.contact_email,
  c.phone,
  c.description,
  jsonb_build_object(
    'source_table', 'classifieds',
    'classified_id', c.id,
    'category', c.category,
    'location', c.location,
    'price', c.price,
    'image_url', c.image_url
  ),
  coalesce(c.status, 'pending'),
  'normal',
  coalesce(c.created_at, now()),
  now()
from public.classifieds c
where not exists (
  select 1
  from public.submission_inbox s
  where s.submission_type = 'classified'
    and s.payload ->> 'classified_id' = c.id::text
);
