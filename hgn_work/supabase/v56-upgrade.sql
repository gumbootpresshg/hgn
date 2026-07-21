-- HGN v56 Island Daily / safe public beta polish
-- Safe to run over older HGN schemas. No destructive changes.

create table if not exists launch_checklist (id uuid primary key default gen_random_uuid());
alter table launch_checklist add column if not exists title text;
alter table launch_checklist add column if not exists area text;
alter table launch_checklist add column if not exists item text;
alter table launch_checklist add column if not exists status text default 'todo';
alter table launch_checklist add column if not exists notes text;
alter table launch_checklist add column if not exists owner text;
alter table launch_checklist add column if not exists priority integer default 0;
alter table launch_checklist add column if not exists created_at timestamptz default now();
alter table launch_checklist add column if not exists updated_at timestamptz default now();
do $$ begin
  begin alter table launch_checklist alter column title drop not null; exception when others then null; end;
end $$;

create table if not exists beta_feedback (id uuid primary key default gen_random_uuid());
alter table beta_feedback add column if not exists name text;
alter table beta_feedback add column if not exists email text;
alter table beta_feedback add column if not exists area text;
alter table beta_feedback add column if not exists message text;
alter table beta_feedback add column if not exists severity text default 'note';
alter table beta_feedback add column if not exists status text default 'open';
alter table beta_feedback add column if not exists created_at timestamptz default now();

create table if not exists daily_brief_items (id uuid primary key default gen_random_uuid());
alter table daily_brief_items add column if not exists title text;
alter table daily_brief_items add column if not exists type text;
alter table daily_brief_items add column if not exists href text;
alter table daily_brief_items add column if not exists summary text;
alter table daily_brief_items add column if not exists town text;
alter table daily_brief_items add column if not exists priority integer default 0;
alter table daily_brief_items add column if not exists status text default 'active';
alter table daily_brief_items add column if not exists starts_at timestamptz;
alter table daily_brief_items add column if not exists ends_at timestamptz;
alter table daily_brief_items add column if not exists created_at timestamptz default now();

create table if not exists events (id uuid primary key default gen_random_uuid());
alter table events add column if not exists title text;
alter table events add column if not exists description text;
alter table events add column if not exists category text;
alter table events add column if not exists town text;
alter table events add column if not exists location text;
alter table events add column if not exists event_date date;
alter table events add column if not exists event_time text;
alter table events add column if not exists status text default 'pending';
alter table events add column if not exists published_at timestamptz;
alter table events add column if not exists created_at timestamptz default now();

create table if not exists notices (id uuid primary key default gen_random_uuid());
alter table notices add column if not exists title text;
alter table notices add column if not exists type text;
alter table notices add column if not exists town text;
alter table notices add column if not exists message text;
alter table notices add column if not exists status text default 'pending';
alter table notices add column if not exists published_at timestamptz;
alter table notices add column if not exists created_at timestamptz default now();
alter table notices add column if not exists contact_name text;
alter table notices add column if not exists contact_email text;

create table if not exists obituaries (id uuid primary key default gen_random_uuid());
alter table obituaries add column if not exists name text;
alter table obituaries add column if not exists dates text;
alter table obituaries add column if not exists details text;
alter table obituaries add column if not exists notice text;
alter table obituaries add column if not exists status text default 'pending';
alter table obituaries add column if not exists published_at timestamptz;
alter table obituaries add column if not exists created_at timestamptz default now();
alter table obituaries add column if not exists contact_name text;
alter table obituaries add column if not exists contact_email text;
alter table obituaries add column if not exists contact_phone text;
alter table obituaries add column if not exists photo_url text;
do $$ begin
  begin alter table obituaries alter column notice drop not null; exception when others then null; end;
end $$;

create table if not exists marketplace_listings (id uuid primary key default gen_random_uuid());
alter table marketplace_listings add column if not exists title text;
alter table marketplace_listings add column if not exists description text;
alter table marketplace_listings add column if not exists category text;
alter table marketplace_listings add column if not exists town text;
alter table marketplace_listings add column if not exists price text;
alter table marketplace_listings add column if not exists status text default 'pending';
alter table marketplace_listings add column if not exists created_at timestamptz default now();
alter table marketplace_listings add column if not exists published_at timestamptz;

create table if not exists newsletter_signups (id uuid primary key default gen_random_uuid());
alter table newsletter_signups add column if not exists email text;
alter table newsletter_signups add column if not exists name text;
alter table newsletter_signups add column if not exists source text;
alter table newsletter_signups add column if not exists status text default 'active';
alter table newsletter_signups add column if not exists created_at timestamptz default now();

alter table articles add column if not exists homepage_section text;
alter table articles add column if not exists priority integer default 0;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists featured boolean default false;
alter table articles add column if not exists newsletter_pick boolean default false;

insert into daily_brief_items (title, type, href, summary, town, priority, status)
select 'What’s happening today', 'events', '/events', 'Check today and this weekend’s community events.', 'Haida Gwaii', 10, 'active'
where not exists (select 1 from daily_brief_items where title = 'What’s happening today');

insert into daily_brief_items (title, type, href, summary, town, priority, status)
select 'Send a notice', 'notices', '/notices', 'Submit notices, community announcements and paper items for editor review.', 'All communities', 8, 'active'
where not exists (select 1 from daily_brief_items where title = 'Send a notice');

insert into daily_brief_items (title, type, href, summary, town, priority, status)
select 'Support local journalism', 'support', '/support', 'Help keep Haida Gwaii News free to read online.', 'Haida Gwaii', 7, 'active'
where not exists (select 1 from daily_brief_items where title = 'Support local journalism');

insert into launch_checklist (title, area, item, status, notes, priority)
select 'Vercel beta deploy', 'Deployment', 'Deploy to a private Vercel beta URL and test on phone', 'todo', 'Do this before moving the real domain.', 10
where not exists (select 1 from launch_checklist where item = 'Deploy to a private Vercel beta URL and test on phone');
