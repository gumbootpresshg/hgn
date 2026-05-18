import { supabase } from "@/lib/supabase";

async function submitPlan(formData: FormData) {
  "use server";
  await supabase.from("contributor_plans").insert({
    contributor_name: String(formData.get("contributor_name") || ""),
    contributor_email: String(formData.get("contributor_email") || ""),
    planned_submission: String(formData.get("planned_submission") || ""),
    size: String(formData.get("size") || ""),
    notes: String(formData.get("notes") || ""),
    status: "planned",
  });
}

export default function ContributorPlanPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-black text-hgnNavy">Tell the Editor What You’re Sending</h1>
      <p className="mt-3 text-slate-600">Contributors can quickly tell the newsroom what is coming for the next edition.</p>
      <form action={submitPlan} className="mt-6 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm">
        <label className="grid gap-1 font-bold">Name<input name="contributor_name" required className="rounded-lg border px-3 py-2" /></label>
        <label className="grid gap-1 font-bold">Email<input type="email" name="contributor_email" required className="rounded-lg border px-3 py-2" /></label>
        <label className="grid gap-1 font-bold">What are you submitting?<input name="planned_submission" placeholder="Column, article, photos, notices..." className="rounded-lg border px-3 py-2" /></label>
        <label className="grid gap-1 font-bold">Size<select name="size" className="rounded-lg border px-3 py-2"><option>Short item</option><option>Half page</option><option>Full page</option><option>Photos only</option><option>Not sure yet</option></select></label>
        <label className="grid gap-1 font-bold">Notes<textarea name="notes" rows={5} className="rounded-lg border px-3 py-2" /></label>
        <button className="rounded-full bg-hgnBlue px-5 py-3 font-black text-white">Send Plan</button>
      </form>
    </main>
  );
}
