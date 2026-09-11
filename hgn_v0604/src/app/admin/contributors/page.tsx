import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ContributorPlansPage() {
  const { data: plans } = await supabase.from("contributor_plans").select("*").order("edition_date", { ascending: true }).limit(100);

  async function addPlan(formData: FormData) {
    "use server";
    await supabase.from("contributor_plans").insert({
      contributor_name: String(formData.get("contributor_name") || ""),
      contributor_email: String(formData.get("contributor_email") || ""),
      edition_date: String(formData.get("edition_date") || "") || null,
      contribution_type: String(formData.get("contribution_type") || "column"),
      length: String(formData.get("length") || ""),
      needs_photos: formData.get("needs_photos") === "on",
      notes: String(formData.get("notes") || ""),
      status: "planned",
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black text-hgnNavy">Admin: Contributor Plans</h1>
      <p className="mt-2 text-slate-600">Track what columnists and contributors plan to submit for upcoming editions.</p>

      <form action={addPlan} className="mt-8 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-2">
        <label className="grid gap-1 font-bold">Contributor name<input name="contributor_name" required className="rounded-lg border p-3 font-normal" /></label>
        <label className="grid gap-1 font-bold">Email<input name="contributor_email" type="email" className="rounded-lg border p-3 font-normal" /></label>
        <label className="grid gap-1 font-bold">Edition date<input name="edition_date" type="date" className="rounded-lg border p-3 font-normal" /></label>
        <label className="grid gap-1 font-bold">Contribution type<select name="contribution_type" className="rounded-lg border p-3 font-normal"><option>column</option><option>half page</option><option>full page</option><option>photos</option><option>brief</option><option>other</option></select></label>
        <label className="grid gap-1 font-bold">Length<input name="length" placeholder="half page, full page, 500 words..." className="rounded-lg border p-3 font-normal" /></label>
        <label className="mt-7 flex items-center gap-2 font-bold"><input type="checkbox" name="needs_photos" className="h-5 w-5" /> Includes / needs photos</label>
        <label className="grid gap-1 font-bold md:col-span-2">Notes<textarea name="notes" rows={4} className="rounded-lg border p-3 font-normal" /></label>
        <button className="rounded-full bg-hgnBlue px-5 py-3 font-black text-white md:w-fit">Save contributor plan</button>
      </form>

      <section className="mt-8 grid gap-4">
        {plans?.map((p: any) => (
          <article key={p.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase text-hgnBlue">{p.contribution_type || "Contribution"} · {p.status || "planned"}</div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{p.contributor_name || p.contributor_email || "Contributor"}</h2>
            <p className="mt-2 text-sm text-slate-600">{p.edition_date ? `Edition: ${p.edition_date}` : "No edition date"}{p.length ? ` · ${p.length}` : ""}{p.needs_photos ? " · photos" : ""}</p>
            {p.notes && <p className="mt-3 text-slate-700">{p.notes}</p>}
          </article>
        ))}
      </section>
    </main>
  );
}
