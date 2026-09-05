import "server-only";

export type PublicSubmissionNotice = {
  submissionType: string;
  sourceId: string;
  title?: string | null;
  submitterName?: string | null;
  submitterEmail?: string | null;
  summary?: string | null;
  publicAdminUrl?: string | null;
  receivedAt?: string | null;
  metadata?: Record<string, unknown>;
};

const DEFAULT_OPERATIONS_WEBHOOK =
  "https://office.haidagwaiinews.com/api/public-submissions/notify";

export async function notifyHgnOperations(
  notice: PublicSubmissionNotice
): Promise<{ delivered: boolean; error?: string }> {
  const secret = process.env.HGN_PUBLIC_SITE_WEBHOOK_SECRET;
  const url = process.env.HGN_OPERATIONS_WEBHOOK_URL || DEFAULT_OPERATIONS_WEBHOOK;

  if (!secret) {
    console.warn("[HGN Operations] Webhook secret is not configured.");
    return { delivered: false, error: "Webhook secret not configured" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-hgn-operations-secret": secret,
      },
      body: JSON.stringify({
        source_id: notice.sourceId,
        submission_type: notice.submissionType,
        title: notice.title ?? "Public submission",
        submitter_name: notice.submitterName ?? null,
        submitter_email: notice.submitterEmail ?? null,
        summary: notice.summary ?? null,
        public_admin_url: notice.publicAdminUrl ?? null,
        received_at: notice.receivedAt ?? null,
        metadata: notice.metadata ?? {},
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[HGN Operations] webhook rejected", response.status);
      return { delivered: false, error: `Webhook returned ${response.status}` };
    }

    return { delivered: true };
  } catch (error) {
    console.error(
      "[HGN Operations] webhook delivery failed",
      error instanceof Error ? error.name : "unknown_error"
    );
    return { delivered: false, error: "Webhook delivery failed" };
  }
}
