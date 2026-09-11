import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default async function LaunchPage() {
  const { data: items } = await supabase.from("launch_checklist").select("*").order("created_at", { ascending: false });
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Private Beta</p>
    <h1 className="mt-2 text-4xl font-black text-hgnNavy">Launch Readiness Desk</h1>
    <p className="mt-3 max-w-3xl text-slate-600">Track final jobs before HGN goes online as a private beta.</p>
    <section className="mt-8 grid gap-4">{(items || []).map((item:any)=>
      <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{item.area || "Launch"}</span>
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase text-hgnBlue">{item.status || "todo"}</span>
        </div>
        <h2 className="mt-3 text-2xl font-black text-slate-950">{item.item || item.title}</h2>
        {item.notes && <p className="mt-2 text-slate-600">{item.notes}</p>}
      </article>)}</section>
  </main>;
}