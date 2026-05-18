import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTrustCenterSnapshot, trustTone, trustToneClasses } from "@/lib/trust-center";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createTrustItem(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("trust_items").insert({
    title,
    item_type: String(formData.get("item_type") || "correction"),
    status: String(formData.get("status") || "draft"),
    severity: String(formData.get("severity") || "normal"),
    related_url: String(formData.get("related_url") || "").trim() || null,
    summary: String(formData.get("summary") || "").trim() || null,
    public_note: String(formData.get("public_note") || "").trim() || null,
    internal_note: String(formData.get("internal_note") || "").trim() || null,
    owner: String(formData.get("owner") || "").trim() || null,
    published_at: ["published", "resolved"].includes(String(formData.get("status") || "")) ? new Date().toISOString() : null,
  });
}

async function updateTrustStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "draft");
  if (!id) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["published", "resolved"].includes(status)) {
    patch.published_at = new Date().toISOString();
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
  }
  await supabase.from("trust_items").update(patch).eq("id", id);
}

async function updateRequestStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "triage");
  if (!id) return;
  await supabase.from("correction_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
}

export default async function AdminTrustPage() {
  const snapshot = await getTrustCenterSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Trust readiness", `${snapshot.score}%`, "Published trust notes minus unresolved risk", signal],
    ["Public notes", snapshot.publicItems.length, "Corrections, clarifications and transparency notes", snapshot.publicItems.length ? "good" : "warn"],
    ["Open requests", snapshot.openRequests.length, "Reader reports still needing triage", snapshot.openRequests.length ? "warn" : "good"],
    ["Urgent/high", snapshot.urgent.length, "Items that should not wait", snapshot.urgent.length ? "bad" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v71 Trust + Corrections</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Trust Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-700">Triage reader correction requests, publish clarifications and keep public beta trust issues visible.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Link href="/trust" className="hgn-btn-primary">Public trust center</Link><Link href="/request-correction" className="hgn-btn-dark">Correction form</Link><Link href="/admin/comms" className="hgn-btn-dark">Comms</Link></div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${trustToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Correction requests</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.requests.map((item) => <form key={item.id} action={updateRequestStatus} className={`rounded-xl border p-4 ${trustToneClasses(trustTone(item.status, item.priority))}`}><input type="hidden" name="id" value={item.id} /><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.issue_type} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.related_url || "General report"}</h3><p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.message}</p>{item.email && <p className="mt-2 text-xs font-bold opacity-70">From: {item.name || "Reader"} · {item.email}</p>}</div><div className="flex flex-wrap gap-2"><button name="status" value="triage" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Triage</button><button name="status" value="accepted" className="rounded-lg bg-hgnBlue px-3 py-2 text-xs font-black text-white">Accept</button><button name="status" value="resolved" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Resolve</button><button name="status" value="declined" className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-black text-white">Decline</button></div></div></form>)}
            {!snapshot.requests.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No correction requests yet.</p>}
          </div>
        </div>

        <aside className="grid content-start gap-6">
          <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Publish trust note</h2><form action={createTrustItem} className="mt-5 grid gap-3"><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<select name="item_type" defaultValue="correction"><option>correction</option><option>clarification</option><option>editor-note</option><option>known-issue</option><option>policy</option><option>transparency-note</option></select></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>published</option><option>resolved</option></select></label></div><div className="grid gap-3 md:grid-cols-2"><label>Severity<select name="severity" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Owner<input name="owner" /></label></div><label>Related URL<input name="related_url" placeholder="/articles/story-slug" /></label><label>Summary<textarea name="summary" rows={3} /></label><label>Public note<textarea name="public_note" rows={5} /></label><label>Internal note<textarea name="internal_note" rows={4} /></label><button className="hgn-btn-primary">Save trust note</button></form></div>
        </aside>
      </section>

      <section className="mt-8 hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Published trust log</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{snapshot.items.map((item) => <form key={item.id} action={updateTrustStatus} className={`rounded-xl border p-4 ${trustToneClasses(trustTone(item.status, item.severity))}`}><input type="hidden" name="id" value={item.id} /><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.item_type} · {item.severity} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.summary && <p className="mt-2 text-sm opacity-80">{item.summary}</p>}<div className="mt-3 flex flex-wrap gap-2"><button name="status" value="review" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Review</button><button name="status" value="published" className="rounded-lg bg-hgnBlue px-3 py-2 text-xs font-black text-white">Publish</button><button name="status" value="resolved" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Resolve</button><button name="status" value="archived" className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-black text-white">Archive</button></div></form>)}</div></section>
    </main>
  );
}
