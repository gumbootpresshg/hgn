# HGN v209 — Dynamic Columns Menu

## Fixed

The Columns menu was limited to four hardcoded entries.

## Changed

- Header tries to load column names from published `articles`.
- Uses fields:
  - `column_name`
  - `column`
  - column-related `category`
  - column-related `section`
- Keeps a larger fallback list so the menu is not empty.
- Added `/columns`
- Added `/columns/[slug]`

## Fallback column list

- Islanders
- Ask Annie
- On the Rocks
- This Week in History
- Council Briefs
- North Coast Nature
- Haida Gwaii Eats
- Arts & Culture
- Fishing Report
- Community Voices
- From the Editor
- Letters from Home

## SQL

No SQL required.
