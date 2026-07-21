-- HGN v70 upgrade: Launch Communications Center
-- Adds reusable beta communications templates and public/internal beta update posts.

create table if not exists beta_comms_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  channel text not null default 'newsletter' check (channel in ('newsletter', 'social', 'site-banner', 'direct', 'print', 'other')),
  audience text not null default 'beta-readers' check (audience in ('beta-readers', 'contributors', 'advertisers', 'public', 'internal')),
  purpose text not null default 'update' check (purpose in ('invite', 'update', 'reminder', 'issue', 'release')),
  subject text,
  body text,
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beta_update_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  body text,
  category text not null default 'release' check (category in ('release', 'known-issue', 'fix', 'request', 'announcement')),
  visibility text not null default 'public' check (visibility in ('public', 'beta-only', 'internal')),
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'scheduled', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists beta_comms_templates_channel_idx on beta_comms_templates(channel);
create index if not exists beta_comms_templates_audience_idx on beta_comms_templates(audience);
create index if not exists beta_update_posts_status_idx on beta_update_posts(status);
create index if not exists beta_update_posts_visibility_idx on beta_update_posts(visibility);
create index if not exists beta_update_posts_published_at_idx on beta_update_posts(published_at desc nulls last);

insert into beta_comms_templates (title, channel, audience, purpose, subject, body)
values
  ('Closed beta invite template', 'newsletter', 'beta-readers', 'invite', 'Help test the new HGN website', 'We are opening a controlled beta for trusted readers. Please test the homepage, article pages, community submissions and mobile experience, then send feedback through the beta form.'),
  ('Contributor workflow template', 'direct', 'contributors', 'invite', 'Test the HGN contributor workflow', 'Please test story drafting, media upload, editorial preflight and publishing notes. Report anything confusing or broken.'),
  ('Known issue update template', 'site-banner', 'public', 'issue', 'Beta known issue', 'We are tracking a beta issue and will update this note when it is resolved.'),
  ('Release improvement template', 'social', 'public', 'release', 'HGN beta update', 'We shipped a beta improvement based on reader and contributor feedback.')
on conflict do nothing;

insert into beta_update_posts (title, summary, body, category, visibility, status, published_at)
values
  ('HGN beta communications center is live', 'The team now has one place to manage beta invites, public updates and launch messaging.', 'This update adds a communications desk for beta messages, reusable templates and public beta update posts. It is designed to keep readers, contributors and advertisers informed while the site moves toward public beta.', 'release', 'public', 'approved', now()),
  ('How to help during beta', 'Use the site normally, then report confusing pages, broken links, mobile issues or missing local information.', 'Helpful feedback includes the page you were on, what device you used, what you expected to happen and what actually happened.', 'request', 'public', 'approved', now())
on conflict do nothing;
