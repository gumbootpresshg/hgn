import "server-only";

export type PublicSubmissionNotice = {
  submissionType: string;
  sourceId: string;
  title?: string | null;
  submitterName?: string | null;
  submitterEmail?: string | null;
  publicAdminUrl?: string | null;
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
    console.warn("[HGN Operations] HGN_PUBLIC_SITE_WEBHOOK_SECRET is not configured.");
    return { delivered: false, error: "Webhook secret not configured" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${secret}`,
        "x-hgn-webhook-secret": secret,
      },
      body: JSON.stringify({
        source_id: notice.sourceId,
        submission_type: notice.submissionType,
        title: notice.title ?? null,
        submitter_name: notice.submitterName ?? null,
        submitter_email: notice.submitterEmail ?? null,
        public_admin_url: notice.publicAdminUrl ?? null,
        metadata: notice.metadata ?? {},
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[HGN Operations] webhook rejected", response.status, detail);
      return { delivered: false, error: `Webhook returned ${response.status}` };
    }

    return { delivered: true };
  } catch (error) {
    console.error("[HGN Operations] webhook delivery failed", error);
    return {
      delivered: false,
      error: error instanceof Error ? error.message : "Unknown webhook error",
    };
  }
}
