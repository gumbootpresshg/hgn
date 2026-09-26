-- HGN v0.66.7 - Reader support page refresh
-- Public HGN only. Updates the editable Support page; no Operations data or
-- financial records are introduced here.

update public.hgn_site_pages
set
  title = 'Keep Haida Gwaii News free for everyone.',
  eyebrow = 'Reader-supported local journalism',
  description = 'Every print issue and every story online is free to read. Reader support helps keep it that way.',
  blocks = '[
    {"id":"support-patreon","type":"button","label":"Support monthly on Patreon","url":"https://www.patreon.com/HaidaGwaiiNews"},
    {"id":"support-advertise","type":"button","label":"Advertise with HGN","url":"/advertise"},
    {"id":"support-why","type":"heading","content":"Free in print and online","level":2},
    {"id":"support-why-copy","type":"paragraph","content":"For Vince and Stacey, keeping independent local news free in print and online is a core value. We believe everyone should be able to read what is happening on the islands without a paywall."},
    {"id":"support-writers","type":"heading","content":"Where your support goes","level":2},
    {"id":"support-writers-copy","type":"paragraph","content":"Reader support first helps cover the real costs of producing the paper and website. After essential bills are paid, paying HGN writers is the first priority. Further support helps us provide stronger reporting, photography, island information and a better service for readers."},
    {"id":"support-options","type":"heading","content":"Support in the way that works for you","level":2},
    {"id":"support-transfer","type":"callout","content":"One-time e-Transfer\\nSend to: support@haidagwaiinews.com\\nMemo: HGN Support\\n\\nMail a cheque\\nPayable to: Haida Gwaii News\\nPO Box 22\\nTlell, BC V0T 1Y0\\nMemo: Reader support"},
    {"id":"support-note","type":"paragraph","content":"Reader support is voluntary and not tax-deductible. Patreon is HGN’s current monthly support option."}
  ]'::jsonb,
  status = 'published',
  visibility = 'public',
  updated_at = now()
where system_key = 'support';
