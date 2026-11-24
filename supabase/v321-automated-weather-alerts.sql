-- HGN v321: allows the Environment Canada weather-alert job to own one live alert.
-- Run after v320-weather-alert-details.sql.

alter table site_alerts add column if not exists source_key text;
alter table site_alerts add column if not exists automated boolean not null default false;
alter table site_alerts add column if not exists last_synced_at timestamptz;

create unique index if not exists site_alerts_source_key_unique
  on site_alerts (source_key)
  where source_key is not null;
