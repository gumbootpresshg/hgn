import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

type CountResult = {
  label: string;
  value: number;
  helper: string;
  href: string;
  tone: "good" | "warn" | "bad" | "neutral";
};

async function safeCount(table: string, build?: (q: any) => any) {
  try {
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    if (build) query = build(query);
    const { count, error } = await query;
    if (error) return null;
    return count || 0;
  } catch {
    return null;
  }
}

async function safeRows(table: string, order = "created_at", limit = 10) {
  try {
    const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(limit);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

async function updateChecklist(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "todo");
  if (!id) return;
  await supabase
    .from("launch_checklist")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
}

async function createTestSession(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_test_sessions").insert({
    title,
    tester_name: String(formData.get("tester_name") || "").trim() || null,
    device: String(formData.get("device") || "").trim() || null,
    browser: String(formData.get("browser") || "").trim() || null,
    status: "active",
  });
}

async function updateFeedback(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new");
  if (!id) return;
  const patch: Row = { status };
  if (status === "fixed") patch.fixed_at = new Date().toISOString();
  await supabase.from("beta_feedback").update(patch).eq("id", id);
}

function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function statClasses(tone: CountResult["tone"]) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-white text-slate-900";
}

export default async function BetaCommandPage() {
  const [published, drafts, feedbackOpen, feedbackFixed, checklist, sessions, recentFeedback, submissions] = await Promise.all([
    safeCount("articles", (q) => q.eq("status", "published")),
    safeCount("articles", (q) => q.in("status", ["draft", "review", "scheduled"])),
    safeCount("beta_feedback", (q) => q.in("status", ["new", "in_review", "open"])),
    safeCount("beta_feedback", (q) => q.eq("status", "fixed")),
    safeRows("launch_checklist", "priority", 40),
    safeRows("beta_test_sessions", "created_at", 6),
    safeRows("beta_feedback", "created_at", 8),
    safeRows("submission_inbox", "created_at", 8),
  ]);

  const checklistRows = checklist as Row[];
  const done = checklistRows.filter((i) => ["done", "fixed", "complete"].includes(String(i.status || "").toLowerCase())).length;
  const blockers = checklistRows.filter((i) => i.blocking && !["done", "fixed", "complete"].includes(String(i.status || "").toLowerCase()));
  const readiness = Math.max(0, Math.min(100, pct(done, checklistRows.length) - blockers.length * 8));

  const stats: CountResult[] = [
    { label: "Readiness", value: readiness, helper: `${done}/${checklistRows.length || 0} launch items complete`, href: "/admin/beta", tone: readiness >= 80 ? "good" : readiness >= 55 ? "warn" : "bad" },
    { label: "Blockers", value: blockers.length, helper: "Blocking launch tasks still open", href: "/admin/beta", tone: blockers.length ? "bad" : "good" },
    { label: "Published", value: published ?? 0, helper: "Live stories available for beta readers", href: "/admin/articles", tone: (published || 0) >= 8 ? "good" : "warn" },
    { label: "Feedback", value: feedbackOpen ?? 0, helper: `${feedbackFixed || 0} fixed so far`, href: "/admin/feedback", tone: (feedbackOpen || 0) > 10 ? "bad" : (feedbackOpen || 0) > 0 ? "warn" : "good" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Private Beta</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Beta Command Centre</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            One working desk for getting HGN beta-ready: readiness score, launch blockers, tester sessions, feedback triage, submissions and publishing signals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/beta-feedback" className="hgn-btn-primary">Open feedback form</Link>
          <Link href="/admin/beta-ops" className="hgn-btn-dark">Open beta ops</Link>
          <Link href="/admin/status" className="hgn-btn-dark">Run site status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-2xl border p-5 shadow-sm ${statClasses(s.tone)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{s.label}</div>
            <div className="mt-2 text-4xl font-black">{s.label === "Readiness" ? `${s.value}%` : s.value}</div>
            <p className="mt-2 text-sm font-semibold opacity-80">{s.helper}</p>
          </Link>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hgn-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-hgnNavy">Blocking launch items</h2>
              <p className="mt-1 text-sm text-slate-600">Keep this list short. Anything blocking should be solved before public beta.</p>
            </div>
            <Link href="/admin/beta" className="text-sm font-black text-hgnBlue hover:underline">Full checklist →</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {!blockers.length && <div className="rounded-xl bg-green-50 p-4 font-bold text-green-800">No blocking checklist items marked open.</div>}
            {blockers.slice(0, 8).map((item) => (
              <article key={item.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{item.area || "Launch"} · {item.status || "todo"}</div>
                    <h3 className="mt-1 font-black text-slate-950">{item.item || item.title}</h3>
                    {item.notes && <p className="mt-1 text-sm text-slate-600">{item.notes}</p>}
                  </div>
                  <form action={updateChecklist}>
                    <input type="hidden" name="id" value={item.id} />
                    <button name="status" value="done" className="rounded-lg bg-green-700 px-3 py-2 text-sm font-black text-white">Mark done</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Start a beta test session</h2>
          <p className="mt-1 text-sm text-slate-600">Use this when someone tests mobile, publishing, submissions, ads or reader pages.</p>
          <form action={createTestSession} className="mt-5 grid gap-3">
            <label>Session title<input name="title" placeholder="Mobile homepage pass" required /></label>
            <div className="grid gap-3 md:grid-cols-2">
              <label>Tester<input name="tester_name" placeholder="Name" /></label>
              <label>Device<input name="device" placeholder="iPhone, Android, laptop" /></label>
            </div>
            <label>Browser<input name="browser" placeholder="Safari, Chrome, Edge" /></label>
            <button className="hgn-btn-primary">Create session</button>
          </form>
          <div className="mt-6 grid gap-3">
            {(sessions as Row[]).map((s) => (
              <div key={s.id} className="rounded-xl bg-slate-50 p-3">
                <div className="font-black text-hgnNavy">{s.title}</div>
                <div className="text-xs font-semibold text-slate-500">{s.tester_name || "Tester"} · {s.device || "Device not set"} · {s.status || "active"}</div>
              </div>
            ))}
            {!(sessions as Row[]).length && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No beta test sessions yet.</p>}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="hgn-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-hgnNavy">Feedback triage</h2>
            <Link href="/admin/feedback" className="text-sm font-black text-hgnBlue hover:underline">Feedback desk →</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {(recentFeedback as Row[]).map((f) => (
              <article key={f.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{f.issue_type || f.area || "Feedback"} · {f.status || "new"}</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{f.message}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">{f.page_url || "General"} {f.email ? `· ${f.email}` : ""}</p>
                  </div>
                  <form action={updateFeedback} className="flex gap-2">
                    <input type="hidden" name="id" value={f.id} />
                    <button name="status" value="in_review" className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white">Review</button>
                    <button name="status" value="fixed" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Fixed</button>
                  </form>
                </div>
              </article>
            ))}
            {!(recentFeedback as Row[]).length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No feedback yet.</p>}
          </div>
        </div>

        <div className="hgn-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-hgnNavy">Incoming submissions</h2>
            <Link href="/admin/submissions" className="text-sm font-black text-hgnBlue hover:underline">Submission desk →</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {(submissions as Row[]).map((s) => (
              <article key={s.id} className="rounded-xl border bg-white p-4">
                <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{s.type || "Submission"} · {s.status || "pending"}</div>
                <h3 className="mt-1 font-black text-slate-950">{s.title || "Untitled"}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{s.message || s.description || s.body || "No message provided."}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500">{s.name || s.contact_name || "Unknown"} {s.email || s.contact_email ? `· ${s.email || s.contact_email}` : ""}</p>
              </article>
            ))}
            {!(submissions as Row[]).length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No recent submissions in the unified inbox.</p>}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-hgnNavy p-6 text-white shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-sky-200">Recommended beta rule</p>
        <h2 className="mt-2 text-3xl font-black">Do not open public beta until readiness is 80%+, blockers are zero, and the homepage has at least 8 real published local stories.</h2>
        <p className="mt-3 max-w-4xl text-slate-100">That gives you enough content, enough workflow confidence, and enough feedback tracking to invite readers without looking unfinished.</p>
      </section>
    </main>
  );
}
