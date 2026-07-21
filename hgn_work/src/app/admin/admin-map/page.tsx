import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { adminMapTone, getAdminMapSnapshot } from "@/lib/admin-map";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addAdminMapTool(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const href = String(formData.get("href") || "").trim();
  if (!title || !href) return;

  await supabase.from("admin_map_tools").insert({
    title,
    href,
    tool_group: String(formData.get("tool_group") || "workflow"),
    tool_status: String(formData.get("tool_status") || "occasional"),
    use_when: String(formData.get("use_when") || "").trim() || null,
    keep_reason: String(formData.get("keep_reason") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateAdminMapStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("admin_map_tools")
    .update({ tool_status: String(formData.get("tool_status") || "occasional"), updated_at: new Date().toISOString() })
    .eq("id", id);
}

function ToolCard({ tool }: { tool: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${adminMapTone(tool.tool_status)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{tool.tool_group}</span>
        <span>{tool.tool_status}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{tool.title}</h3>
      <Link href={tool.href || "/admin"} className="mt-2 inline-flex text-sm font-black underline">
        Open tool
      </Link>
      {tool.use_when ? <p className="mt-3 text-sm leading-6 opacity-80">Use when: {tool.use_when}</p> : null}
      {tool.keep_reason ? <p className="mt-2 text-sm leading-6 opacity-80">Why keep it: {tool.keep_reason}</p> : null}
      <form action={updateAdminMapStatus} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={tool.id} />
        {['primary', 'occasional', 'parked', 'hide'].map((status) => (
          <button key={status} name="tool_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function AdminMapPage() {
  const snapshot = await getAdminMapSnapshot();

  const stats = [
    ["Simplicity score", `${snapshot.score}%`, "Higher means fewer daily tools"],
    ["Primary tools", snapshot.primary.length, "Keep this under four"],
    ["Occasional", snapshot.occasional.length, "Open only when needed"],
    ["Parked", snapshot.parked.length, "Not part of daily flow"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v119 Admin Map</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Admin Map</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A consolidation map for the two-person admin/editor beta. Decide what is primary, occasional, parked, or hidden.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/newsroom-hub" className="hgn-btn-dark">Newsroom Hub</Link>
          <Link href="/admin-map-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div>
            <div className="mt-2 text-4xl font-black text-hgnNavy">{value}</div>
            <p className="mt-2 text-sm text-slate-600">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Tool decisions</h2>
          {snapshot.tools.length ? (
            snapshot.tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No tools mapped yet.</div>
          )}
        </div>

        <aside className="grid gap-6">
          <form action={addAdminMapTool} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Map another tool</h2>
            <input name="title" placeholder="Tool name" className="rounded-xl border px-4 py-3" />
            <input name="href" placeholder="/admin/example" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="tool_group" className="rounded-xl border px-4 py-3">
                <option value="core">Core</option>
                <option value="publishing">Publishing</option>
                <option value="homepage">Homepage</option>
                <option value="media">Media</option>
                <option value="live">Live</option>
                <option value="cleanup">Cleanup</option>
              </select>
              <select name="tool_status" className="rounded-xl border px-4 py-3">
                <option value="primary">Primary</option>
                <option value="occasional">Occasional</option>
                <option value="parked">Parked</option>
                <option value="hide">Hide</option>
              </select>
            </div>
            <textarea name="use_when" placeholder="Use when..." className="min-h-24 rounded-xl border px-4 py-3" />
            <textarea name="keep_reason" placeholder="Why keep this?" className="min-h-24 rounded-xl border px-4 py-3" />
            <button type="submit" className="hgn-btn-primary">Add tool</button>
          </form>

          <section className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Rule</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              If a tool is not helping the admin/editor workflow this week, park it. The beta should feel calm and fast, not crowded.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
