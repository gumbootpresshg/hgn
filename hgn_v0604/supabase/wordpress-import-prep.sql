create extension if not exists pgcrypto;

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  excerpt text,
  body text,
  author_name text,
  section text,
  category text,
  tags text[],
  image_url text,
  status text default 'published',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  wordpress_id text,
  wordpress_url text
);

alter table articles add column if not exists wordpress_id text;
alter table articles add column if not exists wordpress_url text;
alter table articles add column if not exists image_url text;
alter table articles add column if not exists excerpt text;
alter table articles add column if not exists author_name text;
alter table articles add column if not exists section text;
alter table articles add column if not exists category text;
alter table articles add column if not exists tags text[];
alter table articles add column if not exists published_at timestamptz;
alter table articles add column if not exists updated_at timestamptz default now();

create unique index if not exists articles_slug_unique_idx on articles(slug);
create index if not exists articles_wordpress_id_idx on articles(wordpress_id);
