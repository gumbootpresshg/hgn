import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hasPublisherAccess } from "@/lib/server/publisher-access";

async function clients(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) throw new Error("Supabase server settings are incomplete.");
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/, "");
  if (!token) throw new Error("Login required.");
  const auth = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const { data: { user } } = await auth.auth.getUser(token);
  if (!user || !(await hasPublisherAccess(auth, user))) throw new Error("Publisher or editor access required.");
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const db = await clients(req);
    const { id } = await context.params;
    const { error } = await db
      .from("submission_inbox")
      .delete()
      .eq("id", id)
      .eq("submission_type", "contact_message");
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Message could not be deleted." }, { status: 403 });
  }
}
