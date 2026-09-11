import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function createAssignment(formData: FormData) {
  "use server";
  await supabase.from("newsroom_assignments").insert({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    assigned_to: String(formData.get("assigned_to") || ""),
    due_date: String(formData.get("due_date") || "") || null,
    status: "open",
  });
}

export default async function AssignmentsPage() {
  const { data: assignments } = await supabase
    .from("newsroom_assignments")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black text-hgnNavy">Newsroom Assignments</h1>
      <p className="mt-3 text-slate-600">Track upcoming stories, edition tasks, photos, and contributor commitments.</p>

      <form action={createAssignment} className="mt-6 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-2">
        <label className="grid gap-1 font-bold">Title<input name="title" required className="rounded-lg border px-3 py-2" /></label>
        <label className="grid gap-1 font-bold">Assigned to<input name="assigned_to" className="rounded-lg border px-3 py-2" /></label>
        <label className="grid gap-1 font-bold">Due date<input type="date" name="due_date" className="rounded-lg border px-3 py-2" /></label>
        <label className="grid gap-1 font-bold md:col-span-2">Notes<textarea name="description" rows={4} className="rounded-lg border px-3 py-2" /></label>
        <button className="rounded-full bg-hgnBlue px-5 py-3 font-black text-white">Add Assignment</button>
      </form>

      <section className="mt-8 grid gap-4">
        {assignments?.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{item.status}</div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-500">Assigned to {item.assigned_to || "Newsroom"}{item.due_date ? ` · Due ${item.due_date}` : ""}</p>
            {item.description && <p className="mt-3 text-slate-700">{item.description}</p>}
          </article>
        ))}
      </section>
    </main>
  );
}
