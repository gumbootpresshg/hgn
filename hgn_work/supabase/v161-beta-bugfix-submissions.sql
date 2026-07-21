-- HGN v161 - Beta Bugfix: Submissions, RLS, Admin Review
-- Safe to run after v160. Public visitors can insert; authenticated admin/editor can review.

create extension if not exists pgcrypto;

create table if not exists public.letters_to_editor (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  location text,
  subject text,
  message text,
  body text,
  status text not null default 'pending',
  source text default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.letters_to_editor add column if not exists name text;
alter table public.letters_to_editor add column if not exists email text;
alter table public.letters_to_editor add column if not exists phone text;
alter table public.letters_to_editor add column if not exists location text;
alter table public.letters_to_editor add column if not exists subject text;
alter table public.letters_to_editor add column if not exists message text;
alter table public.letters_to_editor add column if not exists body text;
alter table public.letters_to_editor add column if not exists status text default 'pending';
alter table public.letters_to_editor add column if not exists source text default 'website';
alter table public.letters_to_editor add column if not exists created_at timestamptz default now();
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text,
  contact_name text,
  contact_email text,
  contact_phone text,
  category text default 'notice',
  status text not null default 'pending',
  source text default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notices add column if not exists title text;
alter table public.notices add column if not exists body text;
alter table public.notices add column if not exists contact_name text;
alter table public.notices add column if not exists contact_email text;
alter table public.notices add column if not exists contact_phone text;
alter table public.notices add column if not exists category text default 'notice';
alter table public.notices add column if not exists status text default 'pending';
alter table public.notices add column if not exists source text default 'website';
alter table public.notices add column if not exists created_at timestamptz default now();
alter table public.notices add column if not exists updated_at timestamptz default now();

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

alter table public.submission_inbox add column if not exists submission_type text;
alter table public.submission_inbox add column if not exists title text;
alter table public.submission_inbox add column if not exists sender_name text;
alter table public.submission_inbox add column if not exists sender_email text;
alter table public.submission_inbox add column if not exists sender_phone text;
alter table public.submission_inbox add column if not exists message text;
alter table public.submission_inbox add column if not exists payload jsonb default '{}'::jsonb;
alter table public.submission_inbox add column if not exists status text default 'pending';
alter table public.submission_inbox add column if not exists priority text default 'normal';
alter table public.submission_inbox add column if not exists admin_notes text;
alter table public.submission_inbox add column if not exists created_at timestamptz default now();
alter table public.submission_inbox add column if not exists updated_at timestamptz default now();

create table if not exists public.classified_submissions (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text default 'marketplace',
  price text,
  location text,
  seller_name text,
  seller_email text,
  seller_phone text,
  image_url text,
  status text not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classified_submissions add column if not exists title text;
alter table public.classified_submissions add column if not exists description text;
alter table public.classified_submissions add column if not exists category text default 'marketplace';
alter table public.classified_submissions add column if not exists price text;
alter table public.classified_submissions add column if not exists location text;
alter table public.classified_submissions add column if not exists seller_name text;
alter table public.classified_submissions add column if not exists seller_email text;
alter table public.classified_submissions add column if not exists seller_phone text;
alter table public.classified_submissions add column if not exists image_url text;
alter table public.classified_submissions add column if not exists status text default 'pending';
alter table public.classified_submissions add column if not exists admin_notes text;
alter table public.classified_submissions add column if not exists created_at timestamptz default now();
alter table public.classified_submissions add column if not exists updated_at timestamptz default now();

create table if not exists public.job_submissions (
  id uuid primary key default gen_random_uuid(),
  job_title text,
  employer text,
  location text,
  job_type text,
  pay_range text,
  description text,
  how_to_apply text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_submissions add column if not exists job_title text;
alter table public.job_submissions add column if not exists employer text;
alter table public.job_submissions add column if not exists location text;
alter table public.job_submissions add column if not exists job_type text;
alter table public.job_submissions add column if not exists pay_range text;
alter table public.job_submissions add column if not exists description text;
alter table public.job_submissions add column if not exists how_to_apply text;
alter table public.job_submissions add column if not exists contact_name text;
alter table public.job_submissions add column if not exists contact_email text;
alter table public.job_submissions add column if not exists contact_phone text;
alter table public.job_submissions add column if not exists status text default 'pending';
alter table public.job_submissions add column if not exists created_at timestamptz default now();
alter table public.job_submissions add column if not exists updated_at timestamptz default now();

alter table public.letters_to_editor enable row level security;
alter table public.notices enable row level security;
alter table public.submission_inbox enable row level security;
alter table public.classified_submissions enable row level security;
alter table public.job_submissions enable row level security;

drop policy if exists public_insert_letters_to_editor on public.letters_to_editor;
create policy public_insert_letters_to_editor on public.letters_to_editor
for insert to anon, authenticated with check (true);

drop policy if exists public_insert_notices on public.notices;
create policy public_insert_notices on public.notices
for insert to anon, authenticated with check (true);

drop policy if exists public_insert_submission_inbox on public.submission_inbox;
create policy public_insert_submission_inbox on public.submission_inbox
for insert to anon, authenticated with check (true);

drop policy if exists public_insert_classified_submissions on public.classified_submissions;
create policy public_insert_classified_submissions on public.classified_submissions
for insert to anon, authenticated with check (true);

drop policy if exists public_insert_job_submissions on public.job_submissions;
create policy public_insert_job_submissions on public.job_submissions
for insert to anon, authenticated with check (true);

drop policy if exists authenticated_review_letters_to_editor on public.letters_to_editor;
create policy authenticated_review_letters_to_editor on public.letters_to_editor
for all to authenticated using (true) with check (true);

drop policy if exists authenticated_review_notices on public.notices;
create policy authenticated_review_notices on public.notices
for all to authenticated using (true) with check (true);

drop policy if exists authenticated_review_submission_inbox on public.submission_inbox;
create policy authenticated_review_submission_inbox on public.submission_inbox
for all to authenticated using (true) with check (true);

drop policy if exists authenticated_review_classified_submissions on public.classified_submissions;
create policy authenticated_review_classified_submissions on public.classified_submissions
for all to authenticated using (true) with check (true);

drop policy if exists authenticated_review_job_submissions on public.job_submissions;
create policy authenticated_review_job_submissions on public.job_submissions
for all to authenticated using (true) with check (true);

create index if not exists idx_submission_inbox_status_created on public.submission_inbox (status, created_at desc);
create index if not exists idx_classified_submissions_status_created on public.classified_submissions (status, created_at desc);
create index if not exists idx_job_submissions_status_created on public.job_submissions (status, created_at desc);
