type VercelMetric = { value: number | null; error?: string };

function numeric(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function countFrom(payload: any): number | null {
  for (const value of [payload?.count, payload?.value, payload?.data?.count, payload?.data?.value, payload?.result?.count, payload?.result?.value]) {
    const result = numeric(value);
    if (result !== null) return result;
  }
  return null;
}

async function getCount(resource: "visits" | "visitors", since: string, until: string): Promise<VercelMetric> {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return { value: null, error: "Vercel API connection is not configured." };

  const query = new URLSearchParams({ projectId, since, until });
  if (process.env.VERCEL_TEAM_ID) query.set("teamId", process.env.VERCEL_TEAM_ID);
  try {
    const response = await fetch(`https://api.vercel.com/v1/query/web-analytics/${resource}/count?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return { value: null, error: `Vercel returned ${response.status}.` };
    const value = countFrom(await response.json());
    return value === null ? { value: null, error: "Vercel returned an unrecognized analytics response." } : { value };
  } catch {
    return { value: null, error: "Vercel analytics could not be reached." };
  }
}

export async function getVercelTrafficMetrics(since: string, until: string) {
  const [pageViews, visitors] = await Promise.all([getCount("visits", since, until), getCount("visitors", since, until)]);
  return {
    configured: Boolean(process.env.VERCEL_ANALYTICS_TOKEN && process.env.VERCEL_PROJECT_ID),
    pageViews: pageViews.value,
    visitors: visitors.value,
    error: pageViews.error || visitors.error || null,
  };
}
