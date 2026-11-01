-- Frictionless public voting: no name or email collection.
-- One anonymous ballot per browser token, with a maximum of five ballots per
-- hashed IP address across one contest. Raw IP addresses are never stored.

alter table public.hgn_pumpkin_ballots
  alter column voter_email drop not null,
  add column if not exists voter_token text,
  add column if not exists ip_hash text;

create unique index if not exists hgn_pumpkin_ballots_contest_token_unique
  on public.hgn_pumpkin_ballots(contest_id, voter_token)
  where voter_token is not null;

create index if not exists hgn_pumpkin_ballots_contest_ip_hash_idx
  on public.hgn_pumpkin_ballots(contest_id, ip_hash);

create or replace function public.hgn_limit_pumpkin_ballots_per_ip()
returns trigger
language plpgsql
as $$
begin
  if new.ip_hash is not null then
    perform pg_advisory_xact_lock(hashtext(new.contest_id::text || ':' || new.ip_hash));
  end if;
  if new.ip_hash is not null and (
    select count(*)
    from public.hgn_pumpkin_ballots
    where contest_id = new.contest_id
      and ip_hash = new.ip_hash
  ) >= 5 then
    raise exception 'This internet connection has reached the contest voting limit.';
  end if;
  return new;
end;
$$;

drop trigger if exists hgn_limit_pumpkin_ballots_per_ip_trigger on public.hgn_pumpkin_ballots;
create trigger hgn_limit_pumpkin_ballots_per_ip_trigger
  before insert on public.hgn_pumpkin_ballots
  for each row execute function public.hgn_limit_pumpkin_ballots_per_ip();
