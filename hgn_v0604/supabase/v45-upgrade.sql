-- HGN v45 beta hardening patch
create table if not exists launch_checklist (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text default 'general',
  status text default 'todo',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into launch_checklist (title, area, status, notes)
values
('Test homepage on desktop and phone','public','todo','Confirm masthead, menu, hero story, ads and scroll layout.'),
('Test article editor','admin','todo','Create/edit/publish story, change image, set front page main story.'),
('Test letters page','public','todo','Confirm published letters show and submit form works.'),
('Test event submission and calendar','public','todo','Submit event, approve it, confirm it appears.'),
('Test advertiser request flow','revenue','todo','Submit advertiser inquiry and confirm admin can review.'),
('Test support/donation page','revenue','todo','Confirm Patreon/donation messaging and links.'),
('Test marketplace submission','public','todo','Post listing with town/category and review in admin.'),
('Test live map on mobile','public','todo','Confirm pins, zoom and submit flow.'),
('Remove/hide unfinished pages','public','todo','No 404s or raw coming-soon pages in main user flows.')
on conflict do nothing;

create table if not exists advertiser_leads (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  ad_goal text,
  placement_interest text,
  budget text,
  start_date date,
  end_date date,
  artwork_url text,
  newsletter_opt_in boolean default false,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  amount_interest text,
  message text,
  newsletter_opt_in boolean default true,
  status text default 'new',
  created_at timestamptz default now()
);
