# AI Desk Audit — v0.62.0

## Problem found

The prior Event Finder used a broad date-pattern parser that could create up to 40 candidates from each source. A fixed confidence value around 55% did not meaningfully describe quality. This allowed navigation text, page fragments and weak date matches to create noisy AI Desk items.

The older AI Desk also mixed multiple concepts (news leads, events, Guide updates and site checks) and loaded up to 500 items, 1,000 comments and 1,500 activity rows into the browser at once.

## New operating rule

AI Desk is a research queue, not an intake queue.

- Reader submissions belong in Inbox/Submissions.
- Guide findings belong in Guide Keeper.
- Platform checks belong in Site Health.
- AI Desk keeps source-backed news/event research until a human verifies it.

## Event workflow

AI source scan
→ AI Research candidate
→ staff opens source
→ staff verifies candidate
→ staff promotes candidate
→ Article/Event editor
→ normal editorial review/publishing

No scan result publishes automatically and no scan result appears as a reader submission.

## Known limitations

The Event Finder remains a deterministic source scanner, not a full semantic AI extraction service. It deliberately favors fewer, more reviewable candidates over recall. Sites rendered primarily by client-side JavaScript may still yield weak or empty results when fetched server-side.

A future release could add a structured extraction provider behind the same human-review workflow, but that is not required for this release.
