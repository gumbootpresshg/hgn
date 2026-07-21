import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getMobileQaSnapshot, mobileTone, mobileToneClasses } from "@/lib/mobile-qa";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createDeviceTest(formData: FormData) {
  "use server";
  const device_name = String(formData.get("device_name") || "").trim();
  if (!device_name) return;
  await supabase.from("mobile_device_tests").insert({
    device_name,
    viewport: String(formData.get("viewport") || "").trim() || null,
    browser: String(formData.get("browser") || "Safari"),
    tester: String(formData.get("tester") || "").trim() || null,
    route_path: String(formData.get("route_path") || "/"),
    status: String(formData.get("status") || "untested"),
    priority: String(formData.get("priority") || "normal"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createLighthouseSnapshot(formData: FormData) {
  "use server";
  await supabase.from("mobile_lighthouse_snapshots").insert({
    route_path: String(formData.get("route_path") || "/"),
    device_profile: String(formData.get("device_profile") || "mobile"),
    performance_score: Number(formData.get("performance_score") || 0) || null,
    accessibility_score: Number(formData.get("accessibility_score") || 0) || null,
    best_practices_score: Number(formData.get("best_practices_score") || 0) || null,
    seo_score: Number(formData.get("seo_score") || 0) || null,
    status: String(formData.get("status") || "logged"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createBlocker(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("mobile_launch_blockers").insert({
    title,
    route_path: String(formData.get("route_path") || "").trim() || null,
    area: String(formData.get("area") || "responsive"),
    status: String(formData.get("status") || "open"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    fix_notes: String(formData.get("fix_notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["mobile_device_tests", "mobile_launch_blockers", "mobile_lighthouse_snapshots"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "mobile_device_tests" && ["passed", "failed", "blocked"].includes(status)) patch.tested_at = new Date().toISOString();
  if (table === "mobile_launch_blockers" && ["resolved", "done", "closed"].includes(status)) patch.resolved_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function MobileQaPage() {
  const snapshot = await getMobileQaSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Mobile readiness", `${snapshot.score}%`, "Device coverage, Lighthouse checks and blocker cleanup", signal],
    ["Passed tests", snapshot.passedTests.length, "Real device or viewport checks marked passed", snapshot.passedTests.length ? "good" : "warn"],
    ["Open blockers", snapshot.openBlockers.length, "Mobile issues that can hurt beta readers", snapshot.openBlockers.length ? "bad" : "good"],
    ["Lighthouse avg", snapshot.scoreAverage || "—", "Average of latest logged mobile scores", snapshot.scoreAverage >= 80 ? "good" : "warn"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v81 Mobile QA Center</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Mobile QA Center</h1><p className="mt-3 max-w-3xl text-slate-700">Track phone/tablet checks, responsive launch blockers and Lighthouse snapshots before beta readers hit the site on mobile.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/mobile-status" className="hgn-btn-primary">Public mobile status</Link><Link href="/admin/launch-room" className="hgn-btn-dark">Launch Room</Link><Link href="/admin/preflight" className="hgn-btn-dark">Preflight</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${mobileToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Device test runs</h2><div className="mt-5 grid gap-3">{snapshot.tests.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${mobileToneClasses(mobileTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.route_path} · {item.browser} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.device_name}</h3><p className="mt-1 text-sm font-semibold opacity-80">{[item.viewport, item.tester, item.tested_at && `tested ${new Date(item.tested_at).toLocaleDateString()}`].filter(Boolean).join(" · ") || "No tester assigned"}</p>{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="mobile_device_tests" id={item.id} values={["untested", "passed", "failed", "blocked"]} /></article>)}{!snapshot.tests.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No mobile device tests yet.</p>}</div></div>
      <aside className="grid content-start gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add device test</h2><form action={createDeviceTest} className="mt-5 grid gap-3"><label>Device<input name="device_name" required placeholder="iPhone 15, Pixel 8, iPad Mini..." /></label><div className="grid gap-3 md:grid-cols-2"><label>Viewport<input name="viewport" placeholder="390x844" /></label><label>Browser<input name="browser" defaultValue="Safari" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Route<input name="route_path" defaultValue="/" /></label><label>Status<select name="status" defaultValue="untested"><option>untested</option><option>passed</option><option>failed</option><option>blocked</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Tester<input name="tester" /></label><label>Notes<textarea name="notes" rows={4} /></label><button className="hgn-btn-primary">Save test</button></form></div></aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Mobile blockers</h2><div className="mt-5 grid gap-3">{snapshot.blockers.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${mobileToneClasses(mobileTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm font-semibold opacity-80">{item.route_path || "Site-wide"}{item.owner ? ` · ${item.owner}` : ""}</p>{item.fix_notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.fix_notes}</p>}<StatusButtons table="mobile_launch_blockers" id={item.id} values={["open", "in progress", "blocked", "resolved"]} /></article>)}</div><form action={createBlocker} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add blocker</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Route<input name="route_path" /></label><label>Area<input name="area" defaultValue="responsive" /></label><label>Owner<input name="owner" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Status<select name="status" defaultValue="open"><option>open</option><option>in progress</option><option>blocked</option><option>resolved</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Fix notes<textarea name="fix_notes" rows={3} /></label><button className="hgn-btn-dark">Add blocker</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Lighthouse snapshots</h2><div className="mt-5 grid gap-3">{snapshot.snapshots.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${mobileToneClasses(mobileTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.route_path} · {item.device_profile} · {item.status}</div><h3 className="mt-1 font-black">Perf {item.performance_score ?? "—"} · A11y {item.accessibility_score ?? "—"} · BP {item.best_practices_score ?? "—"} · SEO {item.seo_score ?? "—"}</h3>{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}</article>)}</div><form action={createLighthouseSnapshot} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Log Lighthouse run</h3><div className="grid gap-3 md:grid-cols-2"><label>Route<input name="route_path" defaultValue="/" /></label><label>Profile<input name="device_profile" defaultValue="mobile" /></label></div><div className="grid gap-3 md:grid-cols-4"><label>Perf<input name="performance_score" type="number" min="0" max="100" /></label><label>A11y<input name="accessibility_score" type="number" min="0" max="100" /></label><label>Best<input name="best_practices_score" type="number" min="0" max="100" /></label><label>SEO<input name="seo_score" type="number" min="0" max="100" /></label></div><label>Status<select name="status" defaultValue="logged"><option>logged</option><option>needs-run</option><option>risk</option><option>green</option></select></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Log snapshot</button></form></div>
    </section>
  </main>;
}
