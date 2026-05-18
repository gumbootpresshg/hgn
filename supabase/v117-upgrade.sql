-- HGN v117 - Next-Up Desk
-- Lightweight next-action tracker for the two-person admin/editor beta workflow.

create table if not exists public.next_up_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  lane text not null default 'publishing',
  item_status text not null default 'next',
  urgency text not null default 'soon',
  owner text not null default 'Admin / Editor',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.next_up_checks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  check_area text not null default 'publishing',
  check_status text not null default 'open',
  helper text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.next_up_notes (
  id uuid primary key default gen_random_uuid(),
  note_title text not null,
  note_body text,
  note_status text not null default 'open',
  owner text not null default 'Admin / Editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists next_up_items_status_idx on public.next_up_items(item_status);
create index if not exists next_up_items_lane_idx on public.next_up_items(lane);
create index if not exists next_up_items_urgency_idx on public.next_up_items(urgency);
create index if not exists next_up_items_sort_idx on public.next_up_items(sort_order);
create index if not exists next_up_checks_sort_idx on public.next_up_checks(sort_order);
create index if not exists next_up_notes_status_idx on public.next_up_notes(note_status);

insert into public.next_up_items (title, lane, item_status, urgency, owner, notes, sort_order)
select 'Pick the next story that should move', 'publishing', 'next', 'today', 'Admin / Editor', 'Use this as the top-of-board decision before opening several admin screens.', 10
where not exists (select 1 from public.next_up_items where title = 'Pick the next story that should move');

insert into public.next_up_items (title, lane, item_status, urgency, owner, notes, sort_order)
select 'Confirm the next homepage change', 'frontpage', 'waiting', 'soon', 'Admin / Editor', 'Decide whether the frontpage needs a new lead, a stronger image or a cleanup pass.', 20
where not exists (select 1 from public.next_up_items where title = 'Confirm the next homepage change');

insert into public.next_up_items (title, lane, item_status, urgency, owner, notes, sort_order)
select 'Clear the next media loose end', 'media', 'waiting', 'soon', 'Admin / Editor', 'Caption, credit, crop or alt text should not be the reason a story stalls.', 30
where not exists (select 1 from public.next_up_items where title = 'Clear the next media loose end');

insert into public.next_up_checks (title, check_area, check_status, helper, sort_order)
select 'There is one clear next publishing action', 'publishing', 'open', 'Avoid opening every desk before deciding what matters next.', 10
where not exists (select 1 from public.next_up_checks where title = 'There is one clear next publishing action');

insert into public.next_up_checks (title, check_area, check_status, helper, sort_order)
select 'The frontpage has a next move or an intentional hold', 'frontpage', 'open', 'Keep, replace or deliberately hold the current lead.', 20
where not exists (select 1 from public.next_up_checks where title = 'The frontpage has a next move or an intentional hold');

insert into public.next_up_checks (title, check_area, check_status, helper, sort_order)
select 'The admin/editor handoff is clear', 'handoff', 'open', 'Make the next action obvious for the other person.', 30
where not exists (select 1 from public.next_up_checks where title = 'The admin/editor handoff is clear');

insert into public.next_up_notes (note_title, note_body, note_status, owner)
select 'Next-up desk note', 'Keep this board short. It should show the next useful move, not become another full project tracker.', 'open', 'Admin / Editor'
where not exists (select 1 from public.next_up_notes where note_title = 'Next-up desk note');
