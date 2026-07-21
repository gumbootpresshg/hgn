import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DailyDeskPage() {
  const [{ data: assignments }, { data: plans }, { data: submissions }] = await Promise.all([
    supabase.from("newsroom_assignments").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("contributor_plans").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("public_submissions").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black text-hgnNavy">Daily Desk</h1>
      <p className="mt-2 text-slate-600">A quick newsroom view of assignments, contributor plans and community submissions.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <DeskColumn title="Assignments" items={assignments || []} main="title" sub="assigned_to" />
        <DeskColumn title="Contributor Plans" items={plans || []} main="planned_submission" sub="contributor_name" />
        <DeskColumn title="Submissions" items={submissions || []} main="title" sub="type" />
      </div>
    </main>
  );
}

function DeskColumn({ title, items, main, sub }: { title: string; items: any[]; main: string; sub: string }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-black text-hgnNavy">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-xl bg-slate-50 p-3">
            <div className="font-bold text-slate-900">{item[main] || "Untitled"}</div>
            <div className="mt-1 text-sm text-slate-500">{item[sub] || item.status || "Pending"}</div>
          </div>
        )) : <p className="text-sm text-slate-500">Nothing here yet.</p>}
      </div>
    </section>
  );
}
