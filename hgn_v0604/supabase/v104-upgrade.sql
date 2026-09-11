-- HGN v104 - Shift Center
-- Lightweight admin/editor shift workflow for the two-person beta.

create table if not exists public.shift_center_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_type text not null default 'task',
  shift_status text not null default 'open',
  priority text not null default 'normal',
  owner text not null default 'Admin / Editor',
  due_label text,
  notes text,
  sort_order integer not null default 100,
  is_done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shift_center_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_type text not null default 'handoff',
  owner text not null default 'Admin / Editor',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shift_center_checks (
  id uuid primary key default gen_random_uuid(),
  check_label text not null,
  check_group text not null default 'daily',
  is_ready boolean not null default false,
  helper_text text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shift_center_items_status_idx on public.shift_center_items (shift_status, priority);
create index if not exists shift_center_items_sort_idx on public.shift_center_items (sort_order, created_at);
create index if not exists shift_center_notes_pinned_idx on public.shift_center_notes (is_pinned, updated_at);
create index if not exists shift_center_checks_group_idx on public.shift_center_checks (check_group, sort_order);

insert into public.shift_center_items (title, item_type, shift_status, priority, owner, due_label, notes, sort_order)
values
  ('Pick the next story to finish', 'publishing', 'open', 'high', 'Admin / Editor', 'Today', 'Choose the one item that should move first so the shift has a clear focus.', 10),
  ('Check homepage lead and second slot', 'homepage', 'open', 'normal', 'Admin / Editor', 'Today', 'Make sure the homepage still reflects the newest and most important coverage.', 20),
  ('Review any live or urgent update', 'live', 'watching', 'normal', 'Admin / Editor', 'As needed', 'Keep this simple: update, pin, or clear.', 30),
  ('Leave a short handoff note', 'handoff', 'open', 'normal', 'Admin / Editor', 'End of shift', 'One paragraph is enough for the next person.', 40)
on conflict do nothing;

insert into public.shift_center_notes (note_title, note_body, note_type, owner, is_pinned)
values
  ('Daily handoff', 'Use this note for what changed, what is blocked, and what should go live next.', 'handoff', 'Admin / Editor', true),
  ('Homepage watch', 'Flag anything stale, missing a photo, or no longer appropriate as the lead item.', 'homepage', 'Admin / Editor', false)
on conflict do nothing;

insert into public.shift_center_checks (check_label, check_group, is_ready, helper_text, sort_order)
values
  ('Lead story is clear', 'daily', false, 'There is one obvious story or update to finish first.', 10),
  ('Homepage is not stale', 'daily', false, 'Hero and top slots still match today’s priorities.', 20),
  ('No urgent blocker is hidden', 'daily', false, 'Blocked items are visible before the shift ends.', 30),
  ('Handoff note is current', 'daily', false, 'The other person can tell what happened and what is next.', 40)
on conflict do nothing;
