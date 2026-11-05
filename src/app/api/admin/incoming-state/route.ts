import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hasPublisherAccess } from "@/lib/server/publisher-access";

const ALLOWED_TABLES = new Set([
  "submission_inbox", "letters_to_editor", "event_submissions", "story_tips",
  "correction_requests", "photo_submissions", "notices", "obituaries",
  "visitor_listings", "live_map_items", "classified_submissions", "classifieds",
  "marketplace_posts", "marketplace", "job_submissions",
]);

type Action = "start" | "complete" | "return_new" | "archive" | "delete" | "restore";

async function clients(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) throw new Error("Supabase server settings are incomplete.");
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/, "");
  if (!token) throw new Error("Login required.");
  const auth = createClient(url, anon, {
    global: { headers: { Authorization: \`Bearer \${token}\` } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await auth.auth.getUser(token);
  if (!user || !(await hasPublisherAccess(auth, user))) throw new Error("Publisher or editor access required.");
  return { db: createClient(url, service, { auth: { persistSession: false } }), user };
}

function cleanRecord(input: unknown) {
  const row = (input || {}) as Record<string, unknown>;
  const source_table = String(row.source_table || "").trim();
  const source_id = String(row.source_id || "").trim();
  if (!ALLOWED_TABLES.has(source_table) || !source_id) return null;
  return { source_table, source_id };
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await clients(req);
    const modern = await db
      .from("hgn_incoming_queue_state")
      .select("source_table,source_id,queue_state,workflow_stage,reviewed_at,started_at,completed_at,updated_at")
      .limit(2000);
    if (!modern.error) return NextResponse.json({ states: modern.data || [] });

    // Keeps the old intake screen working until the one-time SQL migration is run.
    const legacy = await db
      .from("hgn_incoming_queue_state")
      .select("source_table,source_id,queue_state,reviewed_at,updated_at")
      .limit(2000);
    if (legacy.error) throw legacy.error;
    return NextResponse.json({ states: legacy.data || [], migration_required: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load queue state." }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db, user } = await clients(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "").toLowerCase() as Action;
    if (!new Set<Action>(["start", "complete", "return_new", "archive", "delete", "restore"]).has(action)) {
      return NextResponse.json({ error: "Unsupported queue action." }, { status: 400 });
    }

    const rawItems = Array.isArray(body.items) ? body.items : [body];
    const items = rawItems.map(cleanRecord).filter(Boolean) as Array<{ source_table: string; source_id: string }>;
    if (!items.length || items.length > 200) return NextResponse.json({ error: "No valid submissions were selected." }, { status: 400 });

    const now = new Date().toISOString();
    const workflow_stage = action === "start" ? "in_progress"
      : action === "complete" ? "done"
      : action === "archive" ? "archived"
      : action === "delete" ? "deleted"
      : "new";
    const queue_state = workflow_stage === "archived" ? "archived" : workflow_stage === "deleted" ? "deleted" : "active";

    const modernRows = items.map((item) => ({
      ...item,
      queue_state,
      workflow_stage,
      reviewed_at: workflow_stage === "in_progress" ? now : null,
      started_at: workflow_stage === "in_progress" ? now : null,
      completed_at: workflow_stage === "done" ? now : null,
      updated_at: now,
      updated_by: user.email || user.id,
    }));
    let { error } = await db.from("hgn_incoming_queue_state").upsert(modernRows, { onConflict: "source_table,source_id" });

    // Safe fallback for an installation that has deployed code before its SQL migration.
    if (error?.code === "42703") {
      const legacyRows = modernRows.map(({ workflow_stage: _stage, started_at: _started, completed_at: _completed, ...row }) => row);
      const legacyResult = await db.from("hgn_incoming_queue_state").upsert(legacyRows, { onConflict: "source_table,source_id" });
      error = legacyResult.error;
    }
    if (error) throw error;
    return NextResponse.json({ ok: true, count: modernRows.length, workflow_stage, queue_state });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Queue action failed." }, { status: 403 });
  }
}
