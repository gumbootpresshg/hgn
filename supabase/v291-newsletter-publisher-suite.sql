-- HGN v0.65.9 Newsletter Publisher Suite. Safe, additive, and rerunnable.
create extension if not exists pgcrypto;

create table if not exists public.hgn_newsletter_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  frequency text not null default 'Biweekly',
  status text not null default 'draft' check (status in ('active','paused','draft')),
  show_on_public_signup boolean not null default false,
  show_in_account_preferences boolean not null default false,
  accept_new_subscribers boolean not null default false,
  allow_sending boolean not null default false,
  show_public_archive boolean not null default false,
  featured boolean not null default false,
  sender_name text,
  reply_to_email text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists hgn_newsletter_one_featured on public.hgn_newsletter_products(featured) where featured;
insert into public.hgn_newsletter_products (name,slug,description,frequency,status,show_on_public_signup,show_in_account_preferences,accept_new_subscribers,allow_sending,show_public_archive,featured,sender_name,sort_order)
values
 ('Haida Gwaii News','hgn-news','The essential local news and community update from Haida Gwaii News.','Biweekly','active',true,true,true,true,true,true,'Haida Gwaii News',10),
 ('Haida Gwaii Guide','guide','Travel, places and seasonal ideas from the Haida Gwaii Guide.','Seasonal','paused',false,false,false,false,false,false,'Haida Gwaii News',20)
on conflict (slug) do nothing;

alter table public.subscribers add column if not exists newsletter_product_slugs text[] not null default '{}'::text[];
update public.subscribers set newsletter_product_slugs = array_append(newsletter_product_slugs, 'guide')
where coalesce(array_length(newsletter_product_slugs,1),0)=0 and exists (select 1 from unnest(coalesce(interests,'{}'::text[])) x where lower(x) like '%guide%');
alter table public.newsletter_editions add column if not exists product_slug text not null default 'hgn-news';

create table if not exists public.hgn_newsletter_signup_page (
  singleton_key text primary key default 'default', headline text not null default 'Get the island update', intro text,
  image_url text, signup_explanation text, success_message text not null default 'You are signed up. Thank you for supporting local news.',
  button_text text not null default 'Sign up', advertising_cta_text text default 'Advertise in our newsletters', advertising_cta_url text default '/advertise',
  footer_note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into public.hgn_newsletter_signup_page (singleton_key,intro,signup_explanation)
values ('default','Sign up for local headlines and community updates from Haida Gwaii News.','Choose the reader updates you would like to receive.') on conflict (singleton_key) do nothing;

create table if not exists public.hgn_newsletter_ad_campaigns (
  id uuid primary key default gen_random_uuid(), advertiser_name text not null, placement text not null check (placement in ('top_banner','mid_banner','business_card','footer_sponsor')),
  creative_url text, destination_url text, alt_text text, start_date date, end_date date,
  status text not null default 'open' check (status in ('open','reserved','sold','house_ad','active','paused','completed')),
  inventory_status text not null default 'open' check (inventory_status in ('open','reserved','sold','house_ad')),
  operations_campaign_ref text, internal_note text, sort_order integer not null default 100,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists hgn_newsletter_ads_active_idx on public.hgn_newsletter_ad_campaigns(placement,status,start_date,end_date,sort_order);

alter table public.hgn_newsletter_products enable row level security;
alter table public.hgn_newsletter_signup_page enable row level security;
alter table public.hgn_newsletter_ad_campaigns enable row level security;
drop policy if exists "hgn newsletter products public read" on public.hgn_newsletter_products;
create policy "hgn newsletter products public read" on public.hgn_newsletter_products for select to anon,authenticated using (status='active' and (show_on_public_signup or show_in_account_preferences));
drop policy if exists "hgn newsletter signup page public read" on public.hgn_newsletter_signup_page;
create policy "hgn newsletter signup page public read" on public.hgn_newsletter_signup_page for select to anon,authenticated using (true);
drop policy if exists "hgn newsletter suite publisher products" on public.hgn_newsletter_products;
create policy "hgn newsletter suite publisher products" on public.hgn_newsletter_products for all to authenticated using (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true))) with check (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true)));
drop policy if exists "hgn newsletter suite publisher signup" on public.hgn_newsletter_signup_page;
create policy "hgn newsletter suite publisher signup" on public.hgn_newsletter_signup_page for all to authenticated using (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true))) with check (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true)));
drop policy if exists "hgn newsletter suite publisher ads" on public.hgn_newsletter_ad_campaigns;
create policy "hgn newsletter suite publisher ads" on public.hgn_newsletter_ad_campaigns for all to authenticated using (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true))) with check (exists(select 1 from public.hgn_profiles p where p.user_id=auth.uid() and (p.is_admin=true or p.can_access_publisher_tools=true)));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('hgn-newsletter-ads','hgn-newsletter-ads',true,10485760,array['image/jpeg','image/png','image/webp','image/gif']) on conflict (id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
drop policy if exists "hgn newsletter ads public read" on storage.objects;
create policy "hgn newsletter ads public read" on storage.objects for select to anon,authenticated using (bucket_id='hgn-newsletter-ads');
drop policy if exists "hgn newsletter ads authenticated write" on storage.objects;
create policy "hgn newsletter ads authenticated write" on storage.objects for insert to authenticated with check (bucket_id='hgn-newsletter-ads');
