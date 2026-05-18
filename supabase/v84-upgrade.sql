-- HGN v84 - Policy Desk
-- Adds beta policy readiness, consent/compliance checks, and launch risk tracking.

create extension if not exists pgcrypto;

create table if not exists public.site_policy_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  policy_type text not null default 'general',
  status text not null default 'draft',
  owner text,
  summary text,
  public_url text,
  version_label text not null default 'beta',
  published_at timestamptz,
  last_reviewed_at timestamptz,
  next_review_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.policy_review_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  policy_area text not null default 'site policy',
  status text not null default 'needs-review',
  priority text not null default 'normal',
  owner text,
  due_date date,
  resolved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consent_compliance_checks (
  id uuid primary key default gen_random_uuid(),
  check_area text not null default 'consent',
  route_path text,
  requirement text not null,
  status text not null default 'needs-review',
  priority text not null default 'normal',
  owner text,
  evidence_url text,
  resolved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_risk_register (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  risk_area text not null default 'publishing',
  severity text not null default 'medium',
  priority text not null default 'normal',
  status text not null default 'open',
  mitigation text,
  owner text,
  resolved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_policy_documents add column if not exists title text;
alter table public.site_policy_documents add column if not exists slug text;
alter table public.site_policy_documents add column if not exists policy_type text not null default 'general';
alter table public.site_policy_documents add column if not exists status text not null default 'draft';
alter table public.site_policy_documents add column if not exists owner text;
alter table public.site_policy_documents add column if not exists summary text;
alter table public.site_policy_documents add column if not exists public_url text;
alter table public.site_policy_documents add column if not exists version_label text not null default 'beta';
alter table public.site_policy_documents add column if not exists published_at timestamptz;
alter table public.site_policy_documents add column if not exists last_reviewed_at timestamptz;
alter table public.site_policy_documents add column if not exists next_review_at date;
alter table public.site_policy_documents add column if not exists notes text;
alter table public.site_policy_documents add column if not exists created_at timestamptz not null default now();
alter table public.site_policy_documents add column if not exists updated_at timestamptz not null default now();

alter table public.policy_review_tasks add column if not exists title text;
alter table public.policy_review_tasks add column if not exists policy_area text not null default 'site policy';
alter table public.policy_review_tasks add column if not exists status text not null default 'needs-review';
alter table public.policy_review_tasks add column if not exists priority text not null default 'normal';
alter table public.policy_review_tasks add column if not exists owner text;
alter table public.policy_review_tasks add column if not exists due_date date;
alter table public.policy_review_tasks add column if not exists resolved_at timestamptz;
alter table public.policy_review_tasks add column if not exists notes text;
alter table public.policy_review_tasks add column if not exists created_at timestamptz not null default now();
alter table public.policy_review_tasks add column if not exists updated_at timestamptz not null default now();

alter table public.consent_compliance_checks add column if not exists check_area text not null default 'consent';
alter table public.consent_compliance_checks add column if not exists route_path text;
alter table public.consent_compliance_checks add column if not exists requirement text;
alter table public.consent_compliance_checks add column if not exists status text not null default 'needs-review';
alter table public.consent_compliance_checks add column if not exists priority text not null default 'normal';
alter table public.consent_compliance_checks add column if not exists owner text;
alter table public.consent_compliance_checks add column if not exists evidence_url text;
alter table public.consent_compliance_checks add column if not exists resolved_at timestamptz;
alter table public.consent_compliance_checks add column if not exists notes text;
alter table public.consent_compliance_checks add column if not exists created_at timestamptz not null default now();
alter table public.consent_compliance_checks add column if not exists updated_at timestamptz not null default now();

alter table public.legal_risk_register add column if not exists title text;
alter table public.legal_risk_register add column if not exists risk_area text not null default 'publishing';
alter table public.legal_risk_register add column if not exists severity text not null default 'medium';
alter table public.legal_risk_register add column if not exists priority text not null default 'normal';
alter table public.legal_risk_register add column if not exists status text not null default 'open';
alter table public.legal_risk_register add column if not exists mitigation text;
alter table public.legal_risk_register add column if not exists owner text;
alter table public.legal_risk_register add column if not exists resolved_at timestamptz;
alter table public.legal_risk_register add column if not exists notes text;
alter table public.legal_risk_register add column if not exists created_at timestamptz not null default now();
alter table public.legal_risk_register add column if not exists updated_at timestamptz not null default now();

create unique index if not exists idx_site_policy_documents_slug on public.site_policy_documents(slug);
create index if not exists idx_site_policy_documents_status on public.site_policy_documents(status);
create index if not exists idx_policy_review_tasks_status on public.policy_review_tasks(status);
create index if not exists idx_consent_compliance_checks_status on public.consent_compliance_checks(status);
create index if not exists idx_legal_risk_register_status on public.legal_risk_register(status);

insert into public.site_policy_documents (title, slug, policy_type, status, summary, public_url, notes)
values
  ('Privacy policy', 'privacy-policy', 'privacy', 'review', 'Explains how reader, subscriber, submission and analytics data will be handled during beta.', '/policies', 'Seed policy for v84 beta readiness.'),
  ('Corrections policy', 'corrections-policy', 'editorial', 'approved', 'Sets the reader-facing process for requesting corrections and how HGN records changes.', '/trust', 'Connected to the Trust Desk.'),
  ('Community submission guidelines', 'community-submission-guidelines', 'community', 'review', 'Defines what readers can submit, moderation expectations and what HGN may decline.', '/policies', 'Important before opening public submissions.'),
  ('Advertising and sponsored content policy', 'advertising-sponsored-policy', 'advertising', 'draft', 'Clarifies ad, sponsor and paid-content labelling before revenue beta.', '/media-kit-beta', 'Connected to Revenue Readiness.')
on conflict (slug) do nothing;

insert into public.policy_review_tasks (title, policy_area, status, priority, notes)
values
  ('Confirm privacy copy covers newsletter, submissions and beta feedback', 'privacy', 'needs-review', 'high', 'Must be ready before a wider beta invite.'),
  ('Review advertising labels for sponsored posts and media kit language', 'advertising', 'needs-review', 'normal', 'Tie into the v72 revenue readiness flow.'),
  ('Publish clear correction request expectations', 'editorial trust', 'in-progress', 'high', 'Connects to /request-correction and /trust.')
on conflict do nothing;

insert into public.consent_compliance_checks (check_area, route_path, requirement, status, priority, notes)
values
  ('newsletter consent', '/newsletter', 'Newsletter signup explains what the reader is signing up for.', 'needs-review', 'high', 'Check copy and form language.'),
  ('submission consent', '/submit-tip', 'Reader submissions explain publication/moderation expectations.', 'needs-review', 'high', 'Important before public beta.'),
  ('corrections', '/request-correction', 'Correction request form has clear use and contact expectations.', 'ready', 'normal', 'Seed check.'),
  ('accessibility', '/accessibility-request', 'Accessibility request path is easy to find from policy/trust areas.', 'ready', 'normal', 'Seed check.')
on conflict do nothing;

insert into public.legal_risk_register (title, risk_area, severity, priority, status, mitigation, notes)
values
  ('Beta opens before privacy/submission language is finalized', 'privacy', 'high', 'high', 'open', 'Complete v84 policy review tasks before public beta expansion.', 'Seed risk for launch-room review.'),
  ('Sponsored content not clearly labelled in early revenue tests', 'advertising', 'medium', 'normal', 'open', 'Use ad policy and revenue desk checks before publishing paid placements.', 'Seed risk.'),
  ('Correction handling is inconsistent across articles', 'editorial trust', 'medium', 'normal', 'review', 'Route correction requests through Trust Desk and log outcomes.', 'Seed risk.')
on conflict do nothing;
