import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function submitAccessibilityRequest(formData: FormData) {
  "use server";
  const message = String(formData.get("message") || "").trim();
  if (!message) return;
  await supabase.from("accessibility_reader_requests").insert({
    name: String(formData.get("name") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    route_path: String(formData.get("route_path") || "").trim() || null,
    request_type: String(formData.get("request_type") || "accessibility-help"),
    message,
    status: "new",
    priority: String(formData.get("priority") || "normal"),
  });
}

export default function AccessibilityRequestPage() {
  return <main className="mx-auto max-w-4xl px-4 py-10">
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Accessibility</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Request accessibility help</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-700">Tell HGN if a page is hard to use, read, navigate or submit. This form logs the request for beta triage.</p>
    </section>

    <form action={submitAccessibilityRequest} className="mt-8 grid gap-4 rounded-3xl border bg-slate-50 p-6">
      <div className="grid gap-4 md:grid-cols-2"><label>Your name<input name="name" autoComplete="name" /></label><label>Email<input name="email" type="email" autoComplete="email" /></label></div>
      <div className="grid gap-4 md:grid-cols-3"><label>Page or route<input name="route_path" placeholder="/articles/..." /></label><label>Request type<select name="request_type" defaultValue="accessibility-help"><option value="accessibility-help">Accessibility help</option><option value="screen-reader">Screen reader issue</option><option value="keyboard">Keyboard/navigation issue</option><option value="contrast">Contrast/readability issue</option><option value="forms">Form issue</option><option value="media">Image/video/audio issue</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div>
      <label>What happened?<textarea name="message" required rows={7} placeholder="Describe what was hard to use and what device/browser you were using." /></label>
      <button className="hgn-btn-primary">Submit request</button>
    </form>

    <div className="mt-8 flex flex-wrap gap-3"><Link href="/accessibility-status" className="hgn-btn-dark">Accessibility status</Link><Link href="/contact" className="hgn-btn-dark">Contact HGN</Link></div>
  </main>;
}
