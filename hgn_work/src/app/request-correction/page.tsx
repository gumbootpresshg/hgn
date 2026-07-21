import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function submitCorrection(formData: FormData) {
  "use server";
  const message = String(formData.get("message") || "").trim();
  if (!message) return;
  await supabase.from("correction_requests").insert({
    name: String(formData.get("name") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    related_url: String(formData.get("related_url") || "").trim() || null,
    issue_type: String(formData.get("issue_type") || "correction"),
    priority: String(formData.get("priority") || "normal"),
    message,
  });
}

export default function RequestCorrectionPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnGold">Help improve HGN</p>
        <h1 className="mt-2 text-5xl font-black">Request a correction</h1>
        <p className="mt-3 text-white/80">Tell us about possible errors, missing context, broken links or privacy concerns during beta.</p>
      </div>

      <form action={submitCorrection} className="mt-8 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2"><label>Name<input name="name" placeholder="Optional" /></label><label>Email<input name="email" type="email" placeholder="Optional, for follow-up" /></label></div>
        <label>Related page or article URL<input name="related_url" placeholder="/articles/example-story" /></label>
        <div className="grid gap-4 md:grid-cols-2"><label>Issue type<select name="issue_type" defaultValue="correction"><option>correction</option><option>clarification</option><option>broken-link</option><option>missing-context</option><option>privacy</option><option>other</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div>
        <label>What should we review?<textarea name="message" required rows={8} placeholder="Please include what looks wrong, what you expected, and any source/context that helps us check it." /></label>
        <div className="flex flex-wrap gap-3"><button className="hgn-btn-primary">Submit request</button><Link href="/trust" className="hgn-btn-dark">View trust center</Link></div>
      </form>
    </main>
  );
}
