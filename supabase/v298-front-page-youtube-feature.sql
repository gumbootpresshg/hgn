-- HGN v0.66.8 - Front-page YouTube live/video feature.
-- Public HGN only. The settings store editorial display configuration, not
-- viewer data, advertising CRM, billing, or Operations records.

alter table public.front_page_settings
  add column if not exists video_is_active boolean not null default false,
  add column if not exists video_url text,
  add column if not exists video_title text,
  add column if not exists video_description text,
  add column if not exists video_starts_at timestamptz,
  add column if not exists video_expires_at timestamptz;

update public.front_page_settings
set video_is_active = coalesce(video_is_active, false)
where id = 'current';

comment on column public.front_page_settings.video_url is
  'Public YouTube URL for the optional front-page live/video feature. The site only embeds recognized YouTube video URLs.';
