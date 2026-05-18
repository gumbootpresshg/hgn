-- HGN v71 upgrade: Trust + Corrections Desk
-- FIXED: idempotent/defensive version for existing partial tables.
-- Adds public trust/corrections workflow for beta transparency and newsroom accountability.

create extension if not exists pgcrypto;

create table if not exists trust_items (
  id uuid primary key default gen_random_uuid()
);

alter table trust_items
  add column if not exists title text,
  add column if not exists item_type text,
  add column if not exists status text,
  add column if not exists severity text,
  add column if not exists related_url text,
  add column if not exists summary text,
  add column if not exists public_note text,
  add column if not exists internal_note text,
  add column if not exists owner text,
  add column if not exists requested_by text,
  add column if not exists resolved_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

update trust_items set title = 'Untitled trust item' where title is null;
update trust_items set item_type = 'correction' where item_type is null;
update trust_items set status = 'draft' where status is null;
update trust_items set severity = 'normal' where severity is null;
update trust_items set created_at = now() where created_at is null;
update trust_items set updated_at = now() where updated_at is null;

alter table trust_items
  alter column title set not null,
  alter column item_type set default 'correction',
  alter column item_type set not null,
  alter column status set default 'draft',
  alter column status set not null,
  alter column severity set default 'normal',
  alter column severity set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

create table if not exists correction_requests (
  id uuid primary key default gen_random_uuid()
);

alter table correction_requests
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists related_url text,
  add column if not exists issue_type text,
  add column if not exists message text,
  add column if not exists status text,
  add column if not exists priority text,
  add column if not exists staff_note text,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

update correction_requests set issue_type = 'correction' where issue_type is null;
update correction_requests set message = 'No message provided' where message is null;
update correction_requests set status = 'new' where status is null;
update correction_requests set priority = 'normal' where priority is null;
update correction_requests set created_at = now() where created_at is null;
update correction_requests set updated_at = now() where updated_at is null;

alter table correction_requests
  alter column issue_type set default 'correction',
  alter column issue_type set not null,
  alter column message set not null,
  alter column status set default 'new',
  alter column status set not null,
  alter column priority set default 'normal',
  alter column priority set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

-- Add validation constraints only if they do not already exist.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'trust_items_item_type_check') then
    alter table trust_items add constraint trust_items_item_type_check check (item_type in ('correction', 'clarification', 'editor-note', 'known-issue', 'policy', 'transparency-note'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'trust_items_status_check') then
    alter table trust_items add constraint trust_items_status_check check (status in ('draft', 'review', 'published', 'resolved', 'archived'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'trust_items_severity_check') then
    alter table trust_items add constraint trust_items_severity_check check (severity in ('low', 'normal', 'high', 'urgent'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'correction_requests_issue_type_check') then
    alter table correction_requests add constraint correction_requests_issue_type_check check (issue_type in ('correction', 'clarification', 'broken-link', 'missing-context', 'privacy', 'other'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'correction_requests_status_check') then
    alter table correction_requests add constraint correction_requests_status_check check (status in ('new', 'triage', 'accepted', 'resolved', 'declined', 'archived'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'correction_requests_priority_check') then
    alter table correction_requests add constraint correction_requests_priority_check check (priority in ('low', 'normal', 'high', 'urgent'));
  end if;
end $$;

create index if not exists trust_items_status_idx on trust_items(status);
create index if not exists trust_items_type_idx on trust_items(item_type);
create index if not exists trust_items_published_at_idx on trust_items(published_at desc nulls last);
create index if not exists correction_requests_status_idx on correction_requests(status);
create index if not exists correction_requests_priority_idx on correction_requests(priority);

insert into trust_items (title, item_type, status, severity, summary, public_note, owner, published_at)
select 'Corrections policy ready for beta', 'policy', 'published', 'normal', 'HGN now has a public place to explain corrections, clarifications and transparency notes.', 'During beta, readers can report possible errors, missing context or broken links. The newsroom can triage those requests and publish correction notes when needed.', 'Editor', now()
where not exists (select 1 from trust_items where title = 'Corrections policy ready for beta');

insert into trust_items (title, item_type, status, severity, summary, public_note, owner, published_at)
select 'Beta transparency log started', 'transparency-note', 'published', 'low', 'The beta site now includes a simple public trust log.', 'This log is meant to show meaningful corrections, clarifications and known public issues without hiding them in internal admin tools.', 'Editor', now()
where not exists (select 1 from trust_items where title = 'Beta transparency log started');
