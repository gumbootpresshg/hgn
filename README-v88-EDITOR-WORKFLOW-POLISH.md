# HGN v88 - Editor Workflow Polish

This upgrade shifts beta work toward the real current setup: founder + editor testing only.

## Added
- `/admin/editor-workbench` - two-person publishing desk
- `/editor-status` - lightweight public/internal status readout
- `src/lib/editor-workbench.ts` - shared snapshot/readiness logic
- `supabase/v88-upgrade.sql` - workbench tables

## Purpose
Instead of expanding the beta into a large public testing program, this version focuses on operator efficiency:
- faster daily publishing
- homepage slot planning
- editor notes
- draft backup/recovery
- simple ready/blocked status tracking

## SQL
Run:

```sql
supabase/v88-upgrade.sql
```
