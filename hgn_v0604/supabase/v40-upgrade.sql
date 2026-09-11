-- HGN v40 Audience + Submission Flow

create extension if not exists pgcrypto;

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  source text,
  status text default 'subscribed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table newsletter_subscribers add column if not exists email text;
alter table newsletter_subscribers add column if not exists name text;
alter table newsletter_subscribers add column if not exists phone text;
alter table newsletter_subscribers add column if not exists source text;
alter table newsletter_subscribers add column if not exists status text default 'subscribed';
alter table newsletter_subscribers add column if not exists created_at timestamptz default now();
alter table newsletter_subscribers add column if not exists updated_at timestamptz default now();
create unique index if not exists newsletter_subscribers_email_unique on newsletter_subscribers(email);

alter table events add column if not exists newsletter_opt_in boolean default false;
alter table notices add column if not exists newsletter_opt_in boolean default false;
alter table marketplace_listings add column if not exists newsletter_opt_in boolean default false;
alter table advertiser_requests add column if not exists newsletter_opt_in boolean default false;

create table if not exists audience_members (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  phone text,
  role text default 'reader',
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table audience_members add column if not exists email text;
alter table audience_members add column if not exists name text;
alter table audience_members add column if not exists phone text;
alter table audience_members add column if not exists role text default 'reader';
alter table audience_members add column if not exists source text;
alter table audience_members add column if not exists created_at timestamptz default now();
alter table audience_members add column if not exists updated_at timestamptz default now();
create unique index if not exists audience_members_email_unique on audience_members(email);
