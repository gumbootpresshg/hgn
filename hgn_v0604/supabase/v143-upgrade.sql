-- HGN v143 - Security + Submission Alerts
-- Defensive migration. Safe to rerun after partial attempts.

create extension if not exists pgcrypto;

create table if not exists public.submission_alert_settings (
  id uuid primary key default gen_random_uuid(),
  alert_key text not null unique,
  alert_label text not null,
  alert_type text not null default 'email',
  destination text,
  is_enabled boolean not null default false,
  notify_on text not null default 'letters_to_editor',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submission_alert_settings add column if not exists alert_key text;
alter table public.submission_alert_settings add column if not exists alert_label text;
alter table public.submission_alert_settings add column if not exists alert_type text default 'email';
alter table public.submission_alert_settings add column if not exists destination text;
alter table public.submission_alert_settings add column if not exists is_enabled boolean default false;
alter table public.submission_alert_settings add column if not exists notify_on text default 'letters_to_editor';
alter table public.submission_alert_settings add column if not exists notes text;
alter table public.submission_alert_settings add column if not exists created_at timestamptz default now();
alter table public.submission_alert_settings add column if not exists updated_at timestamptz default now();

create unique index if not exists submission_alert_settings_alert_key_idx on public.submission_alert_settings(alert_key);

create table if not exists public.submission_alert_log (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null default 'letter_to_editor',
  submission_id uuid,
  recipient text,
  channel text not null default 'email',
  status text not null default 'queued',
  error_message text,
  payload_preview text,
  created_at timestamptz not null default now()
);

alter table public.submission_alert_log add column if not exists submission_type text default 'letter_to_editor';
alter table public.submission_alert_log add column if not exists submission_id uuid;
alter table public.submission_alert_log add column if not exists recipient text;
alter table public.submission_alert_log add column if not exists channel text default 'email';
alter table public.submission_alert_log add column if not exists status text default 'queued';
alter table public.submission_alert_log add column if not exists error_message text;
alter table public.submission_alert_log add column if not exists payload_preview text;
alter table public.submission_alert_log add column if not exists created_at timestamptz default now();

create index if not exists submission_alert_log_created_at_idx on public.submission_alert_log(created_at desc);
create index if not exists submission_alert_log_submission_type_idx on public.submission_alert_log(submission_type);

create table if not exists public.security_hardening_checks (
  id uuid primary key default gen_random_uuid(),
  check_title text not null,
  check_body text,
  check_group text not null default 'security',
  status text not null default 'open',
  priority text not null default 'high',
  owner text default 'Admin / Editor',
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.security_hardening_checks add column if not exists check_title text;
alter table public.security_hardening_checks add column if not exists check_body text;
alter table public.security_hardening_checks add column if not exists check_group text default 'security';
alter table public.security_hardening_checks add column if not exists status text default 'open';
alter table public.security_hardening_checks add column if not exists priority text default 'high';
alter table public.security_hardening_checks add column if not exists owner text default 'Admin / Editor';
alter table public.security_hardening_checks add column if not exists sort_order integer default 100;
alter table public.security_hardening_checks add column if not exists created_at timestamptz default now();
alter table public.security_hardening_checks add column if not exists updated_at timestamptz default now();

create index if not exists security_hardening_checks_sort_idx on public.security_hardening_checks(sort_order, priority);

-- Existing letter table hardening. This keeps public submissions possible while preparing admin-only review.
create table if not exists public.letters_to_editor (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  town text,
  email text not null,
  letter text not null,
  status text not null default 'new',
  ip_hash text,
  user_agent text,
  alert_status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.letters_to_editor add column if not exists status text default 'new';
alter table public.letters_to_editor add column if not exists ip_hash text;
alter table public.letters_to_editor add column if not exists user_agent text;
alter table public.letters_to_editor add column if not exists alert_status text default 'pending';
alter table public.letters_to_editor add column if not exists created_at timestamptz default now();
create index if not exists letters_to_editor_created_at_idx on public.letters_to_editor(created_at desc);
create index if not exists letters_to_editor_status_idx on public.letters_to_editor(status);

insert into public.submission_alert_settings (alert_key, alert_label, alert_type, destination, is_enabled, notify_on, notes)
values
  ('letter_email_primary', 'Letter to the Editor email alert', 'email', null, false, 'letters_to_editor', 'Set destination to your newsroom/admin email before enabling.'),
  ('letter_phone_optional', 'Optional phone alert through SMS email or webhook', 'phone', null, false, 'letters_to_editor', 'Use an email-to-SMS address, Twilio route, or future webhook destination.')
on conflict (alert_key) do update set
  alert_label = excluded.alert_label,
  alert_type = excluded.alert_type,
  notify_on = excluded.notify_on,
  notes = excluded.notes,
  updated_at = now();

insert into public.security_hardening_checks (check_title, check_body, check_group, status, priority, sort_order)
values
  ('Admin pages require verified login', 'Confirm every admin route checks Supabase Auth or middleware before online beta.', 'auth', 'open', 'critical', 10),
  ('RLS enabled on private submission tables', 'Public visitors may insert a letter, but only admin/editor accounts should read submission rows.', 'database', 'open', 'critical', 20),
  ('Service role key stays server-only', 'Never expose SUPABASE_SERVICE_ROLE_KEY or notification provider secrets to client components.', 'secrets', 'open', 'critical', 30),
  ('Submission rate limiting is active', 'Letter submissions should go through the server API with honeypot and basic throttling.', 'forms', 'ready', 'high', 40),
  ('Email alert destination configured', 'Set HGN_ALERT_EMAIL_TO and RESEND_API_KEY, or use Supabase Edge Functions later.', 'alerts', 'open', 'high', 50),
  ('Phone alert method decided', 'For beta, use email-to-SMS or a Twilio webhook only after email alerts are stable.', 'alerts', 'open', 'medium', 60),
  ('File upload restrictions reviewed', 'Restrict uploads by MIME type, size and admin-only media paths.', 'uploads', 'open', 'high', 70),
  ('Security headers reviewed before deployment', 'Confirm CSP, frame, referrer and content-type headers in production hosting.', 'headers', 'open', 'medium', 80)
on conflict do nothing;

-- RLS helper statements. Policies are conservative and may need role names adjusted for your auth model.
alter table public.submission_alert_settings enable row level security;
alter table public.submission_alert_log enable row level security;
alter table public.security_hardening_checks enable row level security;
alter table public.letters_to_editor enable row level security;

drop policy if exists "Public can submit letters" on public.letters_to_editor;
create policy "Public can submit letters" on public.letters_to_editor
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated users can review letters" on public.letters_to_editor;
create policy "Authenticated users can review letters" on public.letters_to_editor
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can manage security checks" on public.security_hardening_checks;
create policy "Authenticated users can manage security checks" on public.security_hardening_checks
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can manage alert settings" on public.submission_alert_settings;
create policy "Authenticated users can manage alert settings" on public.submission_alert_settings
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can read alert logs" on public.submission_alert_log;
create policy "Authenticated users can read alert logs" on public.submission_alert_log
  for select
  to authenticated
  using (true);
