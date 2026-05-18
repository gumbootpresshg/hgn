-- HGN v36 Launch Candidate: notices, obituaries, support/contact/about cleanup

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  details text,
  town text,
  notice_type text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

create table if not exists obituaries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dates text,
  details text,
  image_url text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text default 'pending',
  created_at timestamptz default now(),
  published_at timestamptz
);

alter table articles add column if not exists columnist_name text;
alter table articles add column if not exists section text;
alter table articles add column if not exists front_page_main boolean default false;
alter table articles add column if not exists featured boolean default false;

insert into notices (title, details, town, notice_type, status, published_at)
values
('Submit your community notice', 'Community notices can now be submitted online for editor review. Meeting notices, thank-yous, memorial notices and public announcements are welcome.', 'All Islands', 'Community Notice', 'published', now())
on conflict do nothing;

insert into obituaries (name, dates, details, status, published_at)
values
('Obituary submissions', 'Contact Haida Gwaii News', 'Families can submit obituary information online or contact the paper for help preparing an obituary for print and online publication.', 'published', now())
on conflict do nothing;
