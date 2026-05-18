# HGN Website Build v40 — Audience + Submission Flow

Unzip over `C:\HGN\HGNSite` and replace files.

Run:

```powershell
npm install
Remove-Item .next -Recurse -Force
npm run dev
```

Run `supabase/v40-upgrade.sql` in Supabase SQL Editor.

What changed:
- Newsletter opt-in added to event, notice and advertiser submissions.
- Newsletter subscriber table added.
- Support Us page added/polished.
- Newsletter signup page added.
- Advertise page updated for low-friction inquiries.
- Submission success nudges users toward optional account creation.

Recommended flow:
- Do not force casual users to create accounts before submitting.
- Capture name/email/phone first.
- Offer optional account creation after submission.
- Build the newsletter list from every appropriate public form.
