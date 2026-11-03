-- HGN v0.67.66 - Ensure every Haida Gwaii community is available in Marketplace filters.
-- Safe to run more than once. It adds missing rows without changing existing labels or settings.

insert into public.classified_settings (setting_type, label, slug, sort_order, is_active)
values
  ('town', 'Masset', 'masset', 10, true),
  ('town', 'Old Massett', 'old-massett', 20, true),
  ('town', 'Port Clements', 'port-clements', 30, true),
  ('town', 'Tlell', 'tlell', 40, true),
  ('town', 'Skidegate', 'skidegate', 50, true),
  ('town', 'Daajing Giids', 'daajing-giids', 60, true),
  ('town', 'Sandspit', 'sandspit', 70, true),
  ('town', 'Queen Charlotte', 'queen-charlotte', 80, true),
  ('town', 'Tow Hill', 'tow-hill', 90, true),
  ('town', 'Island-wide', 'island-wide', 100, true),
  ('town', 'Other / Haida Gwaii', 'other-haida-gwaii', 110, true)
on conflict (setting_type, slug) do nothing;

notify pgrst, 'reload schema';
