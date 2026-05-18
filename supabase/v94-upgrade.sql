-- HGN v94 - Media Flow
-- Lightweight image, credit, caption and alt-text cleanup for the two-person admin/editor workflow.

create extension if not exists pgcrypto;

create table if not exists public.media_flow_items (
  id uuid primary key default gen_random_uuid(),
  article_id uuid,
  article_slug text,
  item_title text not null,
  image_url text,
  credit text,
  caption text,
  alt_text text,
  status text default 'needs_review',
  assigned_to text,
  priority text default 'normal',
  needs_credit boolean default true,
  needs_caption boolean default true,
  needs_alt_text boolean default true,
  needs_crop_check boolean default false,
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.media_flow_tasks (
  id uuid primary key default gen_random_uuid(),
  media_item_id uuid references public.media_flow_items(id) on delete cascade,
  task_label text not null,
  task_type text default 'media_check',
  status text default 'todo',
  owner text,
  priority text default 'normal',
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.media_flow_guidelines (
  id uuid primary key default gen_random_uuid(),
  guideline_key text unique not null,
  guideline_label text not null,
  guideline_body text not null,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_media_flow_items_status on public.media_flow_items(status);
create index if not exists idx_media_flow_items_priority on public.media_flow_items(priority);
create index if not exists idx_media_flow_tasks_status on public.media_flow_tasks(status);
create index if not exists idx_media_flow_guidelines_active on public.media_flow_guidelines(is_active);

insert into public.media_flow_guidelines (guideline_key, guideline_label, guideline_body, sort_order)
values
  ('credit_required', 'Credit every image', 'Every published image should have a credit, source, or clear internal note before launch.', 1),
  ('alt_text_plain', 'Use plain alt text', 'Describe the important visual information in simple language. Do not stuff keywords.', 2),
  ('caption_context', 'Captions add local context', 'Use captions to explain who, what, where, and when when the image benefits from context.', 3),
  ('mobile_crop_check', 'Check mobile crops', 'Hero images should still make sense on a phone before they are pinned to the homepage.', 4)
on conflict (guideline_key) do update set
  guideline_label = excluded.guideline_label,
  guideline_body = excluded.guideline_body,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.media_flow_tasks (task_label, task_type, status, owner, priority, notes)
values ('Review today''s homepage images', 'homepage_image_check', 'todo', 'Admin / Editor', 'normal', 'Quick check for credit, caption, alt text and mobile crop before publishing.')
on conflict do nothing;
