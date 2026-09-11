-- HGN v67 upgrade: Editorial preflight and beta publishing QA
-- Run after v66-upgrade.sql.

create extension if not exists pgcrypto;

create table if not exists editorial_preflight_templates (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  area text not null default 'Editorial',
  description text,
  required boolean not null default true,
  sort_order integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists article_preflight_checks (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null,
  template_id uuid references editorial_preflight_templates(id) on delete set null,
  label text not null,
  area text not null default 'Editorial',
  status text not null default 'todo' check (status in ('todo','pass','watch','fail','waived')),
  notes text,
  checked_by text,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists article_publish_notes (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null,
  note_type text not null default 'editorial' check (note_type in ('editorial','legal','photo','seo','correction','launch')),
  status text not null default 'open' check (status in ('open','resolved','waived')),
  note text not null,
  owner text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists beta_publishing_runs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  run_date date not null default current_date,
  status text not null default 'planned' check (status in ('planned','in_progress','published','blocked','cancelled')),
  editor text,
  target_story_count integer not null default 3,
  actual_story_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists article_preflight_checks_article_idx on article_preflight_checks(article_id);
create index if not exists article_preflight_checks_status_idx on article_preflight_checks(status);
create index if not exists article_publish_notes_article_idx on article_publish_notes(article_id);
create index if not exists article_publish_notes_status_idx on article_publish_notes(status);
create index if not exists beta_publishing_runs_date_idx on beta_publishing_runs(run_date desc);

insert into editorial_preflight_templates (label, area, description, required, sort_order)
values
  ('Headline is specific and locally clear', 'Editorial', 'Avoid vague headlines. Make the place, person or issue obvious.', true, 10),
  ('Story has source/context check', 'Editorial', 'Confirm key names, roles, locations, dates and claims.', true, 20),
  ('Featured image has alt text, caption and credit', 'Photo', 'Every beta story should be accessible and properly credited.', true, 30),
  ('SEO title and description are filled', 'SEO', 'Needed for Google, search previews and social cards.', true, 40),
  ('Slug is clean and shareable', 'SEO', 'Use readable lowercase slugs without dates unless needed.', true, 50),
  ('Mobile article view checked', 'UX', 'Open the story on mobile width before publishing.', true, 60),
  ('Google News include decision made', 'Distribution', 'Confirm whether this story should appear in news sitemap/RSS.', false, 70),
  ('Sensitive/community impact reviewed', 'Trust', 'Check names, minors, tragedy, policing, health or cultural sensitivity.', true, 80)
on conflict do nothing;

insert into beta_publishing_runs (title, status, editor, target_story_count, notes)
select 'First beta publishing run', 'planned', 'Editor', 5, 'Use this run to test the full draft to publish workflow.'
where not exists (select 1 from beta_publishing_runs);
