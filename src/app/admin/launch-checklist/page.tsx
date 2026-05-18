import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function LaunchChecklistPage() {
  const { data: items, error } = await supabase
    .from("launch_checklist")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return <main className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-4xl font-black text-hgnNavy">Launch Checklist</h1><p className="mt-4 rounded-xl bg-red-50 p-4 text-hgnBlue">{error.message}</p></main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="border-b pb-6">
        <p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Admin</p>
        <h1 className="text-4xl font-black text-hgnNavy">Launch Checklist</h1>
        <p className="mt-2 text-slate-600">A practical checklist before sending the HGN beta link to staff, owner, or editor.</p>
      </div>

      <section className="mt-8 grid gap-4">
        {items?.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{item.area || "General"}</div>
                <h2 className="mt-1 text-xl font-black text-slate-950">{item.item || item.title || "Checklist item"}</h2>
                {item.notes && <p className="mt-2 text-slate-600">{item.notes}</p>}
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">{item.status || "todo"}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
