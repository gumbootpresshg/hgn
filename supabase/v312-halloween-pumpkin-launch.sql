-- HGN Halloween 2026 launch: replaces the prior front-page promotion.
-- Run after v301 and v310 in the public HGN Supabase project.

update public.front_page_settings
set promotion_is_active = true,
    promotion_eyebrow = 'Halloween on Haida Gwaii',
    promotion_title = 'The Great Haida Gwaii Pumpkin Carve-Off',
    promotion_description = 'Share your best carved pumpkin, then come back to vote for the island favourites.',
    promotion_button_text = 'Enter your pumpkin',
    promotion_url = '/pumpkin-carve-off',
    promotion_image_url = '/pumpkin-carve-off-2026-banner.webp',
    promotion_style = 'charcoal',
    promotion_starts_at = null,
    promotion_expires_at = null
where id = 'current';

-- Keep the existing dates if you have already set them in Admin. The original
-- 2026 contest seed is open now, Oct. 1 through Nov. 1, and accepts entries.
update public.hgn_pumpkin_contests
set status = 'entries'
where slug = 'pumpkin-carve-off-2026'
  and status in ('draft', 'archived');
