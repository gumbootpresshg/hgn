-- HGN v0.66.3 Public Page CMS expansion
-- Additive only. This registers existing public information pages in the
-- Publisher CMS; it does not move sales, billing or Operations records here.

insert into public.hgn_site_pages (slug,title,eyebrow,description,blocks,status,visibility,system_key)
values
('support','Help keep Haida Gwaii News free for everyone.','Support local journalism','Reader support, Patreon supporters, donations, print subscribers and local advertisers help keep community news accessible across Haida Gwaii.',
 '[
   {"id":"support-patreon","type":"button","label":"Support on Patreon","url":"https://www.patreon.com/HaidaGwaiiNews"},
   {"id":"support-advertise","type":"button","label":"Advertise with HGN","url":"/advertise"},
   {"id":"support-reader","type":"heading","content":"Reader supported","level":3},
   {"id":"support-reader-copy","type":"paragraph","content":"Small contributions help keep local reporting available without locking stories behind a paywall."},
   {"id":"support-community","type":"heading","content":"Community first","level":3},
   {"id":"support-community-copy","type":"paragraph","content":"Your support helps cover island news, events, notices, obituaries, sports and local voices."}
 ]'::jsonb,'published','public','support'),
('contact','Contact Haida Gwaii News','Contact','Send news tips, advertising inquiries, letters, notices, obituaries, corrections and community information to the paper.',
 '[
   {"id":"contact-details","type":"callout","content":"Haida Gwaii News\\nPublisher / Editor: Stacey Brzostowski\\nPhone: 250-557-0069\\nMailing address: PO Box 22, Tlell, BC, V0T 1Y0"},
   {"id":"contact-tip","type":"button","label":"Submit a tip","url":"/submit-tip"},
   {"id":"contact-advertise","type":"button","label":"Advertise with HGN","url":"/advertise"},
   {"id":"contact-letters","type":"button","label":"Letters to the editor","url":"/letters"},
   {"id":"contact-notices","type":"button","label":"Public notices","url":"/notices/submit"}
 ]'::jsonb,'published','public','contact'),
('advertise','Advertise With Haida Gwaii News','2026 Rate Card','Island-wide reach across Haida Gwaii, trusted independent local news, and ad dollars that stay local. Haida Gwaii News is distributed as a free print publication every other Thursday.',
 '[
   {"id":"advertise-email","type":"button","label":"Email sales@haidagwaiinews.com","url":"mailto:sales@haidagwaiinews.com"},
   {"id":"advertise-phone","type":"button","label":"Call 250-557-0069","url":"tel:2505570069"},
   {"id":"advertise-print","type":"heading","content":"Print ads","level":2},
   {"id":"advertise-print-rates","type":"table","tableHeaders":["Ad type","Dimensions (W × H)","Price"],"tableRows":[["Business Card","3.5 in × 2.0 in","$55"],["Quarter Page","4.75 in × 6.0 in","$225"],["Banner","9.5 in × 2.5 in","$200"],["Half Page","9.5 in × 6.0 in","$350"],["Full Page","9.5 in × 12.0 in","$600"]]},
   {"id":"advertise-website","type":"heading","content":"Website ads","level":2},
   {"id":"advertise-website-copy","type":"paragraph","content":"Website ads start at $50 for random placement, with front page placement available for $200."},
   {"id":"advertise-deadline","type":"heading","content":"Booking deadline","level":2},
   {"id":"advertise-deadline-copy","type":"paragraph","content":"Booking deadlines are the Friday before publication. Contact sales to reserve space or ask about artwork requirements."},
   {"id":"advertise-dates","type":"heading","content":"2026 issue dates","level":2},
   {"id":"advertise-issue-dates","type":"table","tableHeaders":["Month","Publication dates"],"tableRows":[["January","1, 15, 29"],["February","12, 26"],["March","12, 26"],["April","9, 23"],["May","7, 21"],["June","4, 18"],["July","2, 16, 30"],["August","13, 27"],["September","10, 24"],["October","8, 22"],["November","5, 19"],["December","3, 17, 31"]]}
 ]'::jsonb,'published','public','advertise'),
('community-standards','Community standards','Community','How Haida Gwaii News reviews reader tips, listings, letters, photos and community submissions before publishing.',
 '[
   {"id":"standards-submit","type":"button","label":"Send a submission","url":"/community-board"},
   {"id":"standards-correction","type":"button","label":"Request a correction","url":"/corrections"},
   {"id":"standards-verify","type":"heading","content":"We verify claims","level":3},
   {"id":"standards-verify-copy","type":"paragraph","content":"News tips and public claims may be held while an editor confirms sources, dates, names and context."},
   {"id":"standards-protect","type":"heading","content":"We protect people","level":3},
   {"id":"standards-protect-copy","type":"paragraph","content":"Submissions can be edited or rejected when they expose private information, target people unfairly or create avoidable harm."},
   {"id":"standards-decisions","type":"heading","content":"We explain decisions","level":3},
   {"id":"standards-decisions-copy","type":"paragraph","content":"When possible, HGN gives submitters a clear reason if something needs edits, extra verification or cannot be published."}
 ]'::jsonb,'published','public','community_standards'),
('corrections','Corrections & clarifications','Accuracy','See something that needs correcting? Send the newsroom a clear note and a link to the story.',
 '[{"id":"corrections-note","type":"callout","content":"Please include the story URL or headline, the information you believe needs review, and any reliable source that helps us check it."}]'::jsonb,'published','public','corrections'),
('membership','Create a Free HGN Account','HGN Accounts','A free HGN account lets readers post and manage classifieds, sign up for newsletters, submit events and save stories.',
 '[{"id":"membership-signup","type":"button","label":"Sign up free","url":"/login"},{"id":"membership-note","type":"callout","content":"Paid memberships are not open yet. This page can be updated when supporter memberships are ready."}]'::jsonb,'published','public','membership'),
('subscribe','Subscribe to Haida Gwaii News','Print subscriptions','Subscribe to the print edition by eTransfer or cheque. For help, contact sales@haidagwaiinews.com.',
 '[
   {"id":"subscribe-rates","type":"table","tableHeaders":["Subscription","Price","Details"],"tableRows":[["Haida Gwaii Residents","$130","Annual print subscription for readers on Haida Gwaii."],["Off-Island Residents","$150","Annual print subscription for readers outside Haida Gwaii."]]},
   {"id":"subscribe-pay","type":"heading","content":"How to pay","level":2},
   {"id":"subscribe-pay-copy","type":"callout","content":"eTransfer: sales@haidagwaiinews.com\\nCheque: Haida Gwaii News, PO Box 22, Tlell, BC, V0T 1Y0\\nQuestions: sales@haidagwaiinews.com"}
 ]'::jsonb,'published','public','subscribe')
on conflict (system_key) do nothing;
