# HGN v0.65.8 - Notice Draft Persistence and Attachment-only Notices

- Restores unfinished Notice editor work automatically after reload/tab eviction.
- Continuously stores the working notice in browser localStorage while editing.
- Clears the local working draft after a successful save/publish or when starting a fresh notice.
- Allows a notice to be published with an uploaded PDF/image even when title/body are blank.
- Generates a sensible title from the uploaded filename, organization, notice type, or `Public Notice`.
- Keeps title/body required when no attachment is provided.
