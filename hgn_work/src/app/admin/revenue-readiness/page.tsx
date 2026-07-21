import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getRevenueReadinessSnapshot, revenueTone, revenueToneClasses } from "@/lib/revenue-readiness";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createPackage(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("ad_packages").insert({
    title,
    placement: String(formData.get("placement") || "homepage"),
    status: String(formData.get("status") || "draft"),
    price_cad: Number(formData.get("price_cad") || 0) || null,
    billing_period: String(formData.get("billing_period") || "monthly"),
    summary: String(formData.get("summary") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100) || 100,
  });
}

async function createProspect(formData: FormData) {
  "use server";
  const business_name = String(formData.get("business_name") || "").trim();
  if (!business_name) return;
  await supabase.from("advertiser_prospects").insert({
    business_name,
    contact_name: String(formData.get("contact_name") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    category: String(formData.get("category") || "local-business"),
    status: String(formData.get("status") || "lead"),
    priority: String(formData.get("priority") || "normal"),
    notes: String(formData.get("notes") || "").trim() || null,
    next_step: String(formData.get("next_step") || "").trim() || null,
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("revenue_readiness_tasks").insert({
    title,
    area: String(formData.get("area") || "sales"),
    status: String(formData.get("status") || "todo"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["ad_packages", "advertiser_prospects", "sponsor_assets", "revenue_readiness_tasks"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function RevenueReadinessPage() {
  const snapshot = await getRevenueReadinessSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Revenue readiness", `${snapshot.score}%`, "Packages, prospects, assets and sales launch tasks", signal],
    ["Ready packages", snapshot.readyPackages, "Sellable ad/sponsor packages", snapshot.readyPackages ? "good" : "warn"],
    ["Warm prospects", snapshot.warmProspects, "Advertisers already moving", snapshot.warmProspects ? "good" : "warn"],
    ["Blockers", snapshot.blockers.length, "Revenue launch items needing attention", snapshot.blockers.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v72 Revenue Readiness</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Sponsor + Revenue Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Prepare HGN for beta advertisers: packages, local leads, sponsor assets and launch blockers in one operating view.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/media-kit-beta" className="hgn-btn-primary">Public beta media kit</Link><Link href="/admin/launch-room" className="hgn-btn-dark">Launch room</Link><Link href="/admin/comms" className="hgn-btn-dark">Comms</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${revenueToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Advertiser prospects</h2><div className="mt-5 grid gap-3">{snapshot.prospects.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${revenueToneClasses(revenueTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.category} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.business_name}</h3><p className="mt-1 text-sm font-semibold opacity-80">{[item.contact_name, item.email, item.phone].filter(Boolean).join(" · ") || "No contact saved"}</p>{item.next_step && <p className="mt-2 text-sm opacity-80">Next: {item.next_step}</p>}{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="advertiser_prospects" id={item.id} values={["contacted", "proposal", "won", "lost"]} /></article>)}{!snapshot.prospects.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No advertiser prospects yet.</p>}</div></div>
      <aside className="grid content-start gap-6">
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add prospect</h2><form action={createProspect} className="mt-5 grid gap-3"><label>Business name<input name="business_name" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Contact<input name="contact_name" /></label><label>Email<input name="email" type="email" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Phone<input name="phone" /></label><label>Status<select name="status" defaultValue="lead"><option>lead</option><option>contacted</option><option>proposal</option><option>won</option><option>lost</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Category<input name="category" defaultValue="local-business" /></label><label>Next step<input name="next_step" /></label><label>Notes<textarea name="notes" rows={4} /></label><button className="hgn-btn-primary">Save prospect</button></form></div>
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add readiness task</h2><form action={createTask} className="mt-5 grid gap-3"><label>Task<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Area<select name="area" defaultValue="sales"><option>sales</option><option>creative</option><option>billing</option><option>tracking</option><option>policy</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>doing</option><option>blocked</option><option>ready</option><option>done</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Owner<input name="owner" /></label><label>Notes<textarea name="notes" rows={4} /></label><button className="hgn-btn-dark">Save task</button></form></div>
      </aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Sellable packages</h2><div className="mt-5 grid gap-3">{snapshot.packages.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${revenueToneClasses(revenueTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.placement} · {item.billing_period} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm font-semibold opacity-80">{item.price_cad ? `$${item.price_cad} CAD` : "Price TBD"}</p>{item.summary && <p className="mt-2 text-sm opacity-80">{item.summary}</p>}<StatusButtons table="ad_packages" id={item.id} values={["draft", "review", "ready", "active"]} /></article>)}</div><form action={createPackage} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Create package</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Placement<input name="placement" defaultValue="homepage" /></label><label>Price CAD<input name="price_cad" type="number" min="0" /></label><label>Billing<select name="billing_period" defaultValue="monthly"><option>weekly</option><option>monthly</option><option>campaign</option><option>annual</option></select></label></div><div className="grid gap-3 md:grid-cols-2"><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>ready</option><option>active</option></select></label><label>Sort order<input name="sort_order" type="number" defaultValue="100" /></label></div><label>Summary<textarea name="summary" rows={3} /></label><button className="hgn-btn-primary">Save package</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Revenue launch tasks</h2><div className="mt-5 grid gap-3">{snapshot.tasks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${revenueToneClasses(revenueTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.owner && <p className="mt-1 text-sm font-semibold opacity-80">Owner: {item.owner}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="revenue_readiness_tasks" id={item.id} values={["doing", "blocked", "ready", "done"]} /></article>)}</div></div>
    </section>
  </main>;
}
