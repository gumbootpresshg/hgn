-- HGN v196 - Visible House Ads + Top Menu Links
-- Ensures HGN house ads are active in rotation.
-- Safe to rerun.

create extension if not exists pgcrypto;

alter table public.ads add column if not exists is_house_ad boolean default false;
alter table public.ads add column if not exists rotation_weight integer default 1;
alter table public.ads add column if not exists html_code text;
alter table public.ads add column if not exists title text default 'Untitled ad';
alter table public.ads add column if not exists advertiser_name text;
alter table public.ads add column if not exists placement_key text;
alter table public.ads add column if not exists destination_url text;
alter table public.ads add column if not exists alt_text text;
alter table public.ads add column if not exists status text default 'draft';
alter table public.ads add column if not exists sort_order integer default 0;
alter table public.ads add column if not exists created_at timestamptz default now();
alter table public.ads add column if not exists updated_at timestamptz default now();

update public.ads
set status = 'active',
    rotation_weight = coalesce(rotation_weight, 1),
    destination_url = coalesce(nullif(destination_url, ''), '/advertise'),
    is_house_ad = true,
    updated_at = now()
where title = 'Advertise With Haida Gwaii News'
   or is_house_ad = true;

insert into public.ads (
  title,
  advertiser_name,
  placement_key,
  destination_url,
  alt_text,
  html_code,
  status,
  sort_order,
  rotation_weight,
  is_house_ad,
  notes,
  created_at,
  updated_at
)
select
  'Advertise With Haida Gwaii News',
  'Haida Gwaii News',
  placement_key,
  '/advertise',
  'Advertise with Haida Gwaii News',
  '<a href="/advertise" style="display:block;text-decoration:none;border-radius:22px;overflow:hidden;background:linear-gradient(135deg,#020617,#0f172a);color:white;padding:28px;font-family:Arial,sans-serif;"><div style="font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#67e8f9;">Advertise With Haida Gwaii News</div><div style="margin-top:10px;font-size:30px;line-height:1.05;font-weight:900;">Reach readers across Haida Gwaii</div><div style="margin-top:10px;font-size:15px;line-height:1.55;color:#cbd5e1;">Promote your business, event, service, rental, restaurant, or community organization. Local advertising helps keep independent island journalism free.</div><div style="margin-top:18px;display:inline-block;border-radius:999px;background:#22d3ee;color:#020617;padding:10px 16px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;">View advertising options</div></a>',
  'active',
  999,
  1,
  true,
  'Example rotating house ad. Keep active to promote ad sales.',
  now(),
  now()
from (
  values
    ('site_top'),
    ('home_middle'),
    ('article_top'),
    ('article_bottom')
) as placements(placement_key)
where not exists (
  select 1
  from public.ads a
  where a.is_house_ad = true
    and a.placement_key = placements.placement_key
    and a.title = 'Advertise With Haida Gwaii News'
);
