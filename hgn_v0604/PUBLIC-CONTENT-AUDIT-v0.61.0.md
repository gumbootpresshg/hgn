# Public Content Audit - v0.61.0

## Problems confirmed in v0.60.9
- Homepage mixed manual featured ordering with chronological feeds, allowing older featured Opinion to outrank newer Opinion.
- Latest Headlines was built from stories left over after other homepage slots, so it could jump weeks backward even when newer stories existed.
- Local News classification ignored `subcategory`, causing newer specifically-tagged stories to be skipped.
- Public article lists accepted several legacy statuses while the homepage required `published`, producing inconsistent visibility.
- `/articles` maintained a separate category exclusion system from the shared article router.
- Event approval writes canonical records to `events`, while public event pages still read `event_submissions`.
- Empty events, oversized mobile poll rows, and footer spacing made the mobile page unnecessarily long.

## Rules after v0.61.0
- Manually managed top story/front-page photo remain manually controlled.
- Latest Headlines is always chronological by `published_at`, excluding only the current top story.
- Homepage Opinion selects the newest published opinion item.
- Local-news rails use shared taxonomy and chronological ordering.
- Public article section lists use `status = published`.
- `event_submissions` is review/intake only; `events` is the public event source.
- No database records are deleted or rewritten by this release.

## Deferred cleanup
- Historical/legacy admin routes should be retired separately after editorial workflow confirmation.
- Newsletter event/date formatting still deserves a dedicated consistency pass before mobile-app API freeze.
- Guide static fallbacks versus `hgn_guide_places` remains a separate Guide-completion task.
