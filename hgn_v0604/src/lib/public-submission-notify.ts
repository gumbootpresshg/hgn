export async function notifyPublicSubmission(
  submissionType: string,
  details: {
    sourceId?: string | null;
    title?: string | null;
    submitterName?: string | null;
    submitterEmail?: string | null;
    publicAdminUrl?: string | null;
    metadata?: Record<string, unknown>;
  } = {}
) {
  try {
    await fetch("/api/public-submissions/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        submissionType,
        sourceId: details.sourceId || crypto.randomUUID(),
        title: details.title || null,
        submitterName: details.submitterName || null,
        submitterEmail: details.submitterEmail || null,
        publicAdminUrl: details.publicAdminUrl || null,
        metadata: details.metadata || {},
      }),
    });
  } catch {
    // A submission must remain successful even if the private Operations app is unavailable.
  }
}
