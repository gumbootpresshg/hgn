-- HGN v230 - Official Column Names
-- Optional helper for admin-managed column menu if you use the columnists table.
-- Safe to rerun.

create extension if not exists pgcrypto;

create table if not exists public.columnists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  display_name text,
  description text,
  author_match text,
  category_match text,
  section_match text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_columnists_slug_unique on public.columnists (slug);

insert into public.columnists (name, slug, display_name, category_match, section_match, sort_order, is_active)
values
  ('Tlellagram', 'tlellagram', 'Tlellagram', 'Tlellagram', 'Tlellagram', 10, true),
  ('Living Out Loud', 'living-out-loud', 'Living Out Loud', 'Living Out Loud', 'Living Out Loud', 20, true),
  ('Life on the Gwaii', 'life-on-the-gwaii', 'Life on the Gwaii', 'Life on the Gwaii', 'Life on the Gwaii', 30, true),
  ('GKNS Chronicles', 'gkns-chronicles', 'GKNS Chronicles', 'GKNS Chronicles', 'GKNS Chronicles', 40, true),
  ('Off Island Antics', 'off-island-antics', 'Off Island Antics', 'Off Island Antics', 'Off Island Antics', 50, true),
  ('Wisdom Beyond', 'wisdom-beyond', 'Wisdom Beyond', 'Wisdom Beyond', 'Wisdom Beyond', 60, true),
  ('Island Cuisine', 'island-cuisine', 'Island Cuisine', 'Island Cuisine', 'Island Cuisine', 70, true),
  ('Science Matters', 'science-matters', 'Science Matters', 'Science Matters', 'Science Matters', 80, true),
  ('Backseat Life-ing', 'backseat-life-ing', 'Backseat Life-ing', 'Backseat Life-ing', 'Backseat Life-ing', 90, true),
  ('Book Talk', 'book-talk', 'Book Talk', 'Book Talk', 'Book Talk', 100, true),
  ('Gallivanting', 'gallivanting', 'Gallivanting', 'Gallivanting', 'Gallivanting', 110, true),
  ('Terry''s Take', 'terrys-take', 'Terry''s Take', 'Terry''s Take', 'Terry''s Take', 120, true),
  ('Sandspit Shingle', 'sandspit-shingle', 'Sandspit Shingle', 'Sandspit Shingle', 'Sandspit Shingle', 130, true),
  ('Masset Matters', 'masset-matters', 'Masset Matters', 'Masset Matters', 'Masset Matters', 140, true)
on conflict (slug) do update
set name = excluded.name,
    display_name = excluded.display_name,
    category_match = excluded.category_match,
    section_match = excluded.section_match,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

notify pgrst, 'reload schema';
