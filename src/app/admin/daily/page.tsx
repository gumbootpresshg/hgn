import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminDailyPage() {
  const { data: items } = await supabase
    .from("daily_brief_items")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black text-hgnNavy">Island Daily Desk</h1>
      <p className="mt-3 text-slate-600">Manage the quick daily-use cards that help readers know what to check first.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(items || []).map((item: any) => (
          <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-hgnBlue">{item.type || "Daily"}</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
                {item.href && <p className="mt-2 text-xs font-bold text-slate-500">Links to: {item.href}</p>}
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{item.status}</span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
