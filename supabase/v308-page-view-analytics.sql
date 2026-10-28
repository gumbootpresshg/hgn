-- HGN v0.67.40 - cookieless local page-view analytics.
alter table public.hgn_public_analytics_events
  drop constraint if exists hgn_public_analytics_events_event_type_check;

alter table public.hgn_public_analytics_events
  add constraint hgn_public_analytics_events_event_type_check
  check (event_type in ('page_view', 'article_view', 'ad_impression', 'ad_click', 'newsletter_signup', 'support_click', 'marketplace_lead', 'event_interest', 'search_submit'));
