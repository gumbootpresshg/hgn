-- HGN v0.67.48 - Marketplace categories and automatic publishing.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- Ordinary Marketplace listings publish immediately. Listings with an active
-- safety-review keyword are held as pending for the publisher to review.

alter table public.classifieds
  add column if not exists review_reason text;

-- Restore the complete current category set without re-enabling any category
-- that you previously chose to hide in Marketplace Settings.
insert into public.classified_settings (setting_type, label, slug, sort_order, is_active)
values
  ('marketplace_category', 'Vehicles & Boats', 'vehicles-boats', 10, true),
  ('marketplace_category', 'Real Estate', 'real-estate', 20, true),
  ('marketplace_category', 'Rentals', 'rentals', 30, true),
  ('marketplace_category', 'Jobs', 'jobs', 40, true),
  ('marketplace_category', 'Services', 'services', 50, true),
  ('marketplace_category', 'Home', 'home', 110, true),
  ('marketplace_category', 'Tools & Equipment', 'tools-equipment', 115, true),
  ('marketplace_category', 'Electronics', 'electronics', 120, true),
  ('marketplace_category', 'Clothing & Fashion', 'clothing-fashion', 130, true),
  ('marketplace_category', 'Kids & Baby', 'kids-baby', 140, true),
  ('marketplace_category', 'Sports & Outdoors', 'sports-outdoors', 150, true),
  ('marketplace_category', 'Health & Wellness', 'health-wellness', 160, true),
  ('marketplace_category', 'Hobbies, Music & Collectibles', 'hobbies-music-collectibles', 170, true),
  ('marketplace_category', 'Antiques & Vintage', 'antiques-vintage', 180, true),
  ('marketplace_category', 'Pets', 'pets', 190, true),
  ('marketplace_category', 'Free Stuff', 'free-stuff', 200, true),
  ('marketplace_category', 'Tickets & Events', 'tickets-events', 310, true)
on conflict (setting_type, slug) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    updated_at = now();

-- Old Marketplace categories were consolidated into the current list.
update public.classifieds set category = 'real-estate' where lower(coalesce(category, '')) = 'realty';
update public.classifieds set category = 'tools-equipment' where lower(coalesce(category, '')) in ('farm-industrial', 'farm', 'industrial', 'tools', 'tool', 'equipment');
delete from public.classified_settings
where setting_type = 'marketplace_category' and slug in ('all', 'notices', 'farm-industrial', 'realty');

-- Starter safety words. Add, hide, or remove these in Admin > Marketplace >
-- Marketplace Settings. The label is the word or phrase that is checked.
insert into public.classified_settings (setting_type, label, slug, sort_order, is_active)
values
  ('marketplace_review_keyword', 'firearm', 'firearm', 10, true),
  ('marketplace_review_keyword', 'ammunition', 'ammunition', 20, true),
  ('marketplace_review_keyword', 'explosive', 'explosive', 30, true),
  ('marketplace_review_keyword', 'illegal drug', 'illegal-drug', 40, true),
  ('marketplace_review_keyword', 'counterfeit', 'counterfeit', 50, true)
on conflict (setting_type, slug) do nothing;

create or replace function public.hgn_marketplace_review_keyword(p_title text, p_description text)
returns text
language plpgsql
stable
as $$
declare
  matched_keyword text;
  listing_text text := lower(coalesce(p_title, '') || ' ' || coalesce(p_description, ''));
begin
  select label into matched_keyword
  from public.classified_settings
  where setting_type = 'marketplace_review_keyword'
    and is_active = true
    and length(trim(label)) > 0
    and listing_text like '%' || lower(trim(label)) || '%'
  order by sort_order asc, created_at asc
  limit 1;
  return matched_keyword;
end;
$$;

create or replace function public.hgn_set_marketplace_listing_status()
returns trigger
language plpgsql
as $$
declare
  matched_keyword text;
begin
  matched_keyword := public.hgn_marketplace_review_keyword(new.title, new.description);
  if matched_keyword is not null then
    new.status := 'pending';
    new.review_reason := 'Safety keyword: ' || matched_keyword;
  else
    new.status := 'active';
    new.review_reason := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_hgn_marketplace_auto_publish on public.classifieds;
create trigger trg_hgn_marketplace_auto_publish
before insert or update of title, description on public.classifieds
for each row execute function public.hgn_set_marketplace_listing_status();

notify pgrst, 'reload schema';
