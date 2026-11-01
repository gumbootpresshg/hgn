-- Allow families to use one email for several pumpkin submissions while keeping
-- each individual browser submission idempotent.
alter table public.hgn_pumpkin_entries
  add column if not exists submission_token text;

create unique index if not exists hgn_pumpkin_entries_submission_token_unique
  on public.hgn_pumpkin_entries(contest_id, submission_token)
  where submission_token is not null;
