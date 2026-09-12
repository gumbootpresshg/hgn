# AI Event Source Discovery

## Source lifecycle
- **Candidate**: found automatically; never scanned until reviewed.
- **Trusted**: long-term source used for recurring event research.
- **Watch**: temporary/seasonal source kept active until staff disables it.
- **One-time**: scanned once, then automatically disabled after a successful scan.
- **Ignored**: excluded from research and kept so it is not repeatedly suggested.

## Discovery
The Event Finder includes a **Discover event sources** button. It performs server-side web discovery queries, deduplicates by domain, and adds new domains to the candidate queue.

A daily Vercel Cron route is also included. It requires `CRON_SECRET` in Vercel. Vercel sends that secret as the Authorization bearer token for cron invocations.

No discovered source becomes trusted automatically.
