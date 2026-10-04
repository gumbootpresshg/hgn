-- HGN v0.67.5 - Actual 2026 all-candidates forum schedule and editable format details.
-- Additive only. Public event information; no attendee or question-submitter data.

alter table public.hgn_election_settings
  add column if not exists forum_heading text not null default 'How the forums work',
  add column if not exists forum_summary text,
  add column if not exists forum_format text;

update public.hgn_election_settings
set
  forum_summary = coalesce(forum_summary, 'Doors open at 5 p.m. The School Trustee forum runs from 5:30 to 6:30 p.m., followed by a half-hour break for mingling and individual conversations. The Municipal forum begins at 7 p.m. and ends at 9 p.m.'),
  forum_format = coalesce(forum_format, 'Each forum begins with a one-minute introduction from every candidate, followed by a three-minute campaign statement. Public questions submitted in advance are curated to provide a broad range of inquiry. Every candidate answers each question for one to two minutes, with the speaking order rotated. If time permits, questions from the floor may be included. Light refreshments and snacks are available, but a full dinner is not provided.'),
  forum_heading = coalesce(nullif(forum_heading, ''), 'How the forums work')
where id = 'current';

update public.hgn_election_debates
set event_date = '2026-10-05T17:00:00-07:00', venue_note = 'Port Clements Community Hall · Doors open 5 p.m. · Trustee forum 5:30–6:30 p.m. · Municipal forum 7–9 p.m.', sort_order = 1
where day_label = 'Day one' and event_date is null;
update public.hgn_election_debates
set day_label = 'Port Clements'
where day_label = 'Day one' and event_date = '2026-10-05T17:00:00-07:00';

update public.hgn_election_debates
set event_date = '2026-10-08T17:00:00-07:00', venue_note = 'Daajing Giids Community Hall · Doors open 5 p.m. · Trustee forum 5:30–6:30 p.m. · Municipal forum 7–9 p.m.', sort_order = 2
where day_label = 'Day two' and event_date is null;
update public.hgn_election_debates
set day_label = 'Daajing Giids'
where day_label = 'Day two' and event_date = '2026-10-08T17:00:00-07:00';

update public.hgn_election_debates
set event_date = '2026-10-09T17:00:00-07:00', venue_note = 'Howard Phillips Community Hall, Masset · Doors open 5 p.m. · Trustee forum 5:30–6:30 p.m. · Municipal forum 7–9 p.m.', sort_order = 3
where day_label = 'Day three' and event_date is null;
update public.hgn_election_debates
set day_label = 'Masset'
where day_label = 'Day three' and event_date = '2026-10-09T17:00:00-07:00';
