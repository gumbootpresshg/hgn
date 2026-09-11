import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function updateItem(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const notes = String(formData.get("notes") || "");
  await supabase.from("launch_checklist").update({ status, notes, updated_at: new Date().toISOString() }).eq("id", id);
}

export default async function LaunchChecklistPage() {
  const { data: items } = await supabase.from("launch_checklist").select("*").order("created_at", { ascending: true });
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black text-hgnNavy">Beta Launch Checklist</h1>
      <p className="mt-2 text-slate-600">Use this before sending the test link to the owner, editor, staff, or advertisers.</p>
      <div className="mt-8 grid gap-4">
        {items?.map((item) => (
          <form key={item.id} action={updateItem} className="rounded-2xl border bg-white p-5 shadow-sm">
            <input type="hidden" name="id" value={item.id} />
            <div className="grid gap-4 md:grid-cols-[1fr_180px] md:items-start">
              <div>
                <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{item.area}</div>
                <h2 className="mt-1 text-xl font-black text-slate-950">{item.title}</h2>
                <textarea name="notes" defaultValue={item.notes || ""} className="mt-3 min-h-20 w-full rounded-xl border p-3" placeholder="Notes, issues, fixes needed..." />
              </div>
              <div className="grid gap-2">
                <select name="status" defaultValue={item.status || "todo"} className="rounded-xl border p-3">
                  <option value="todo">To do</option>
                  <option value="checking">Checking</option>
                  <option value="fixed">Fixed</option>
                  <option value="ready">Ready</option>
                </select>
                <button className="rounded-xl bg-hgnNavy px-4 py-3 font-black text-white">Save</button>
              </div>
            </div>
          </form>
        ))}
      </div>
    </main>
  );
}
