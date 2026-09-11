-- HGN v198 - Ad Simplify + Menu Fix
-- Keeps house ad rotation only where wanted:
-- homepage middle and article bottom.
-- Safe to rerun.

update public.ads
set status = case
  when placement_key in ('home_middle', 'article_bottom') then 'active'
  else 'paused'
end,
updated_at = now()
where is_house_ad = true
   or title = 'Advertise With Haida Gwaii News';

update public.ad_placements
set is_active = case
  when coalesce(placement_key, placement) in ('home_middle', 'article_bottom') then true
  else is_active
end,
updated_at = now()
where coalesce(placement_key, placement) in ('site_top', 'home_middle', 'home_sidebar', 'article_top', 'article_bottom');
