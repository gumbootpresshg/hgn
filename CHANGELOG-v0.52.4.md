# HGN v0.52.4

## Newsletter event repair

- Deduplicates upcoming events by normalized title and date before saving and rendering.
- Adds event description, location, community, time, and all-day details to newsletter emails.
- Formats event dates for readers instead of showing raw database dates.
- Adds a clear link to the public Events page for full details and updates.
- Applies the same repair to manual builds and automatic newsletter builds.

No Supabase migration is required.
