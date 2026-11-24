-- HGN v320: detail fields for the compact weather-warning banner.
-- Run this in the Supabase SQL editor before publishing a weather alert.

alter table site_alerts add column if not exists weather_summary text;
alter table site_alerts add column if not exists weather_communities jsonb not null default '[]'::jsonb;
alter table site_alerts add column if not exists source_name text;

comment on column site_alerts.weather_summary is 'Short plain-language weather warning summary.';
comment on column site_alerts.weather_communities is 'Optional array of community wind conditions: name, steadyWind, gusts, timing.';
comment on column site_alerts.source_name is 'Official warning source label, normally Environment Canada.';
