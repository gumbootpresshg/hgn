import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getBetaOpsSnapshot, statusTone, toneClasses } from "@/lib/beta-ops";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createIncident(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_incidents").insert({
    title,
    area: String(formData.get("area") || "").trim() || "General",
    severity: String(formData.get("severity") || "normal"),
    status: "open",
    summary: String(formData.get("summary") || "").trim() || null,
    owner: String(formData.get("owner") || "").trim() || null,
  });
}

async function updateIncident(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "open");
  if (!id) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (status === "resolved") patch.resolved_at = new Date().toISOString();
  await supabase.from("beta_incidents").update(patch).eq("id", id);
}

async function createReleaseNote(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_release_notes").insert({
    title,
    version: String(formData.get("version") || "v66").trim() || "v66",
    summary: String(formData.get("summary") || "").trim() || null,
    audience: String(formData.get("audience") || "internal"),
    status: String(formData.get("status") || "draft"),
    published_at: new Date().toISOString(),
  });
}

async function updateSiteCheck(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "yellow");
  if (!id) return;
  await supabase.from("beta_site_checks").update({ status, checked_at: new Date().toISOString() }).eq("id", id);
}

export default async function BetaOpsPage() {
  const snapshot = await getBetaOpsSnapshot();
  const stats = [
    ["Beta readiness", `${snapshot.readiness}%`, `${snapshot.checklistDone}/${snapshot.checklistTotal} checklist items complete`, snapshot.readiness >= 80 ? "good" : snapshot.readiness >= 55 ? "warn" : "bad"],
    ["Open incidents", snapshot.openIncidents, "Active launch risks being tracked", snapshot.openIncidents ? "bad" : "good"],
    ["Open feedback", snapshot.openFeedback, "New, open or in-review reports", snapshot.openFeedback > 10 ? "bad" : snapshot.openFeedback ? "warn" : "good"],
    ["Published stories", snapshot.published, "Live local stories for beta readers", snapshot.published >= 8 ? "good" : "warn"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v66 Beta Ops</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Launch Operations Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-700">A daily operating board for beta: incidents, public-facing release notes, site checks and the go/no-go signal.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/beta-command" className="hgn-btn-dark">Beta command</Link>
          <Link href="/beta-status" className="hgn-btn-primary">Public beta status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${toneClasses(tone)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm font-semibold opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="hgn-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-hgnNavy">Incident board</h2>
              <p className="mt-1 text-sm text-slate-600">Track anything that could embarrass the beta or block launch.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {snapshot.incidents.map((incident) => (
              <article key={incident.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{incident.area || "General"} · {incident.severity || "normal"} · {incident.status || "open"}</div>
                    <h3 className="mt-1 font-black text-slate-950">{incident.title}</h3>
                    {incident.summary && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{incident.summary}</p>}
                    <p className="mt-2 text-xs font-semibold text-slate-500">Owner: {incident.owner || "Unassigned"}</p>
                  </div>
                  <form action={updateIncident} className="flex flex-wrap gap-2">
                    <input type="hidden" name="id" value={incident.id} />
                    <button name="status" value="monitoring" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Monitor</button>
                    <button name="status" value="resolved" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Resolve</button>
                  </form>
                </div>
              </article>
            ))}
            {!snapshot.incidents.length && <p className="rounded-xl bg-green-50 p-4 font-bold text-green-800">No incidents logged yet.</p>}
          </div>
        </div>

        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Log a launch incident</h2>
          <form action={createIncident} className="mt-5 grid gap-3">
            <label>Title<input name="title" required placeholder="Mobile menu not opening" /></label>
            <div className="grid gap-3 md:grid-cols-2">
              <label>Area<input name="area" placeholder="Mobile, publishing, forms" /></label>
              <label>Severity<select name="severity" defaultValue="normal"><option>normal</option><option>high</option><option>critical</option></select></label>
            </div>
            <label>Owner<input name="owner" placeholder="Who is fixing it?" /></label>
            <label>Summary<textarea name="summary" rows={4} placeholder="What happened, where it happened, and what needs to be checked." /></label>
            <button className="hgn-btn-primary">Create incident</button>
          </form>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Site checks</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.siteChecks.map((check) => (
              <form key={check.id} action={updateSiteCheck} className={`rounded-xl border p-4 ${toneClasses(statusTone(check.status))}`}>
                <input type="hidden" name="id" value={check.id} />
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide opacity-70">{check.area || "Site"} · {check.status || "yellow"}</div>
                    <div className="font-black">{check.label}</div>
                    {check.url && <div className="text-xs font-semibold opacity-70">{check.url}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button name="status" value="green" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Green</button>
                    <button name="status" value="yellow" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Watch</button>
                    <button name="status" value="red" className="rounded-lg bg-hgnBlue px-3 py-2 text-xs font-black text-white">Red</button>
                  </div>
                </div>
              </form>
            ))}
            {!snapshot.siteChecks.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Run the v66 SQL to seed the site checks.</p>}
          </div>
        </div>

        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Release notes</h2>
          <form action={createReleaseNote} className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label>Version<input name="version" defaultValue="v66" /></label>
              <label>Audience<select name="audience" defaultValue="internal"><option>internal</option><option>beta-readers</option><option>public</option></select></label>
            </div>
            <label>Title<input name="title" required placeholder="Beta Ops upgrade shipped" /></label>
            <label>Summary<textarea name="summary" rows={4} placeholder="What changed and what testers should look at next." /></label>
            <label>Status<select name="status" defaultValue="published"><option>draft</option><option>published</option></select></label>
            <button className="hgn-btn-dark">Save release note</button>
          </form>
          <div className="mt-5 grid gap-3">
            {snapshot.releaseNotes.map((note) => (
              <article key={note.id} className="rounded-xl border bg-white p-4">
                <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{note.version || "Beta"} · {note.audience || "internal"} · {note.status || "draft"}</div>
                <h3 className="mt-1 font-black text-slate-950">{note.title}</h3>
                {note.summary && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{note.summary}</p>}
              </article>
            ))}
            {!snapshot.releaseNotes.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No release notes yet.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
