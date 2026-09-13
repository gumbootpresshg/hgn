# AI Newsroom — v0.64.0

## Editor workflow
1. Open AI Desk.
2. Review Story Leads, Events Found, or Things to Check.
3. Open a finding and check the source.
4. Mark it Verified when satisfied.
5. Promote it to an Article Draft or Event Draft, or reject/archive it.

Editors do not need to manage search engines or source lists.

## Event Finder workflow
The normal Event Finder screen has one primary action: **Find events now**.

Behind the scenes HGN:
1. loads Coverage Settings;
2. creates search queries for the publication area, communities, event types, organizations and special terms;
3. searches the wider web;
4. scans existing useful sources;
5. scans newly discovered pages immediately;
6. remembers sources that produce useful results;
7. skips likely duplicates;
8. adds possible events to AI Desk research;
9. leaves publication decisions to staff.

## HGN defaults
Coverage area: Haida Gwaii.

Communities include Masset, Old Massett, Port Clements, Tlell, Skidegate, Daajing Giids, Sandspit, Moresby Island and Graham Island.

Default event searches include community events, festivals, markets, fundraisers, sports, school events, arts, concerts, workshops, meetings, recreation, fairs, cultural events and business events.

These can all be edited under Event Finder > Coverage Settings.

## Source health
Source Health is intentionally hidden under Advanced. HGN automatically remembers useful sources as watch sources and tracks quality, failures and last useful results. Publishers may manually Trust, Auto-manage or Ignore a source.

## Search providers
The discovery helper first tries DuckDuckGo HTML search and falls back to Bing HTML search. No search API key is required for this release. Because public search pages can change or throttle automated access, failed searches are treated as recoverable and do not publish anything.

## Automation
The existing Vercel cron route now runs the full discovery workflow daily. `CRON_SECRET` must remain configured in Vercel.
