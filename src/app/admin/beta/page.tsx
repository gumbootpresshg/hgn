import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function setStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "todo");
  if (!id) return;
  await supabase.from("launch_checklist").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
}

export default async function AdminBetaPage() {
  const { data: checklist } = await supabase
    .from("launch_checklist")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true });

  const { data: feedback } = await supabase
    .from("beta_feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="border-b pb-6">
        <p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Admin</p>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy">Private Beta Control Room</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Use this before sending the site to the owner, editor, contributors or advertisers. Keep the checklist honest and fix anything that feels unfinished.
        </p>
      </div>

      <section className="mt-8 grid gap-4">
        {(checklist || []).map((item) => (
          <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{item.area || "Beta"}</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{item.status || "todo"}</span>
                </div>
                <h2 className="mt-3 text-xl font-black text-slate-950">{item.item || item.title}</h2>
                {item.notes && <p className="mt-2 text-sm leading-6 text-slate-600">{item.notes}</p>}
              </div>
              <div className="flex gap-2">
                {['todo','testing','done'].map((status) => (
                  <form key={status} action={setStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value={status} />
                    <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200">{status}</button>
                  </form>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-black text-hgnNavy">Recent Beta Feedback</h2>
        <div className="mt-4 grid gap-3">
          {!(feedback || []).length && <p className="rounded-2xl border bg-white p-5 text-slate-600">No beta feedback yet.</p>}
          {(feedback || []).map((f) => (
            <article key={f.id} className="rounded-2xl border bg-white p-5">
              <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{f.area || 'General'} · {f.severity || 'note'}</div>
              <p className="mt-2 font-semibold text-slate-900">{f.message}</p>
              <p className="mt-2 text-sm text-slate-500">{f.name || 'Anonymous'} {f.email ? `· ${f.email}` : ''}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
