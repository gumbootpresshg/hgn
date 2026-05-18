import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const { data: items, error } = await supabase
    .from("beta_feedback")
    .select("*")
    .order("created_at", { ascending: false });

  async function updateStatus(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    await supabase.from("beta_feedback").update({ status }).eq("id", id);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black text-hgnNavy">Beta Feedback Desk</h1>
      <p className="mt-2 text-slate-600">Track owner, editor, contributor, and reader testing notes.</p>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-hgnBlue">{error.message}</p>}
      <div className="mt-8 grid gap-4">
        {!items?.length && <div className="rounded-2xl bg-white p-6 shadow-sm">No feedback yet.</div>}
        {items?.map((item) => (
          <article key={item.id} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-hgnBlue">{item.issue_type || "Feedback"} · {item.status || "new"}</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{item.page_url || "General site feedback"}</h2>
                <p className="mt-1 text-sm text-slate-500">{item.name || "Anonymous"} {item.email ? `· ${item.email}` : ""}</p>
              </div>
              <form action={updateStatus} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={item.id} />
                <button name="status" value="new" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold">New</button>
                <button name="status" value="in_review" className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white">Review</button>
                <button name="status" value="fixed" className="rounded-lg bg-green-700 px-3 py-2 text-sm font-bold text-white">Fixed</button>
              </form>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-slate-700">{item.message}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
