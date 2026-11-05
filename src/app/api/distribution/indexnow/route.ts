import { NextRequest, NextResponse } from "next/server";
import { requirePublisher } from "@/lib/newsletters/server";
import { submitIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => ({}));
  const requested = Array.isArray(body?.urls) ? body.urls : [body?.url];
  if (!requested.some((value: unknown) => String(value || "").trim())) {
    return NextResponse.json({ error: "No valid HGN URLs were supplied." }, { status: 400 });
  }

  const result = await submitIndexNow(requested);
  if (result.submitted) return NextResponse.json({ configured: true, ...result });
  const status = result.error === "No valid HGN URLs were supplied." ? 400 : result.status ? 502 : 409;
  return NextResponse.json({ configured: true, ...result }, { status });
}
