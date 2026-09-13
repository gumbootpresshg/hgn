# HGN v0.65.1 — Archive Large Upload Reliability

- Reworked Archive Newsstand uploads so newspaper PDFs no longer pass through a Vercel/Next.js request body.
- Added authenticated signed-upload preparation endpoint for direct Supabase Storage uploads.
- Increased supported newspaper PDF size to 120 MB and cover images to 20 MB.
- Added visible upload stages and progress feedback so staff can tell whether the PDF, cover, or edition metadata is being saved.
- Kept existing-URL and flipbook workflows available.
- Included the v0.65.0 `/about-us` Next.js route-config build correction.
- Restored a safe `.gitignore` so `.next`, `node_modules`, local environment files, and TypeScript build-info files do not enter Git.
