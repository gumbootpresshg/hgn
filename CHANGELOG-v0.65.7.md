# HGN v0.65.7 - Notices Save & Publish Fix

- Repairs the Notices database schema so all fields written by the staff Notices editor exist consistently.
- Fixes Save Draft and Publish failures caused by older/newer `notices` table variants.
- Preserves uploaded notice attachments and existing notice data.
- Improves API error text so failed saves report the actual database reason.
