import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function submitFeedback(formData: FormData) {
  "use server";
  await supabase.from("beta_feedback").insert({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    area: String(formData.get("area") || "General"),
    severity: String(formData.get("severity") || "note"),
    message: String(formData.get("message") || ""),
    status: "open",
  });
}

export default function BetaTestPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Private Beta</p>
      <h1 className="mt-2 text-4xl font-black text-hgnNavy">Help Test the New HGN Site</h1>
      <p className="mt-3 text-lg leading-8 text-slate-700">
        Click around the site on desktop and phone. Tell us what feels broken, confusing, unfinished or awkward before we move closer to a public launch.
      </p>
      <form action={submitFeedback} className="mt-8 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm">
        <label className="grid gap-2 font-bold text-slate-700">Name<input name="name" className="rounded-xl border p-3" /></label>
        <label className="grid gap-2 font-bold text-slate-700">Email<input name="email" type="email" className="rounded-xl border p-3" /></label>
        <label className="grid gap-2 font-bold text-slate-700">Area
          <select name="area" className="rounded-xl border p-3">
            <option>Homepage</option><option>Articles</option><option>Menu</option><option>Mobile</option><option>Marketplace</option><option>Events</option><option>Admin</option><option>Other</option>
          </select>
        </label>
        <label className="grid gap-2 font-bold text-slate-700">Severity
          <select name="severity" className="rounded-xl border p-3">
            <option value="note">Note</option><option value="bug">Bug</option><option value="confusing">Confusing</option><option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="grid gap-2 font-bold text-slate-700">Feedback<textarea name="message" rows={6} required className="rounded-xl border p-3" /></label>
        <button className="rounded-full bg-hgnBlue px-6 py-3 font-black text-white">Send Feedback</button>
      </form>
    </main>
  );
}
