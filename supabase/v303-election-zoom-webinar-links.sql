-- HGN v0.67.7 - Separate public Zoom Webinar links for each election forum.
-- The URLs are public viewing destinations only; no attendee or registration data is stored.

alter table public.hgn_election_debates
  add column if not exists school_zoom_url text,
  add column if not exists municipal_zoom_url text;
