-- HGN v182 - Letters Dates
-- Ensures public letters have a usable date.
-- Safe to rerun.

alter table public.letters_to_editor add column if not exists published_at timestamptz;
alter table public.letters_to_editor add column if not exists created_at timestamptz default now();
alter table public.letters_to_editor add column if not exists updated_at timestamptz default now();

update public.letters_to_editor
set published_at = coalesce(published_at, created_at, updated_at, now()),
    created_at = coalesce(created_at, published_at, updated_at, now()),
    updated_at = now()
where published_at is null
   or created_at is null;

create index if not exists idx_letters_dates
on public.letters_to_editor (published_at desc, created_at desc);
