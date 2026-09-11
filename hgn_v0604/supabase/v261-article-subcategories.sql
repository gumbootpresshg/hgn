-- Adds optional article subcategories for sections such as Opinion.
-- Example: category = Opinion, subcategory = On the Record.

alter table if exists public.articles
  add column if not exists subcategory text;

create index if not exists articles_subcategory_idx
  on public.articles (subcategory);
