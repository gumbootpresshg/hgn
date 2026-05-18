import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getBetaTesterSnapshot } from "@/lib/beta-testers";

export const dynamic = "force-dynamic";

async function joinBeta(formData: FormData) {
  "use server";
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!full_name || !email) return;
  await supabase.from("beta_testers").upsert({
    full_name,
    email,
    community: String(formData.get("community") || "").trim() || null,
    role: String(formData.get("role") || "reader"),
    device: String(formData.get("device") || "").trim() || null,
    priority: "normal",
    status: "new",
    source: "beta-join",
    interests: String(formData.get("interests") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "email" });
}

export default async function BetaJoinPage() {
  const snapshot = await getBetaTesterSnapshot();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm lg:p-12">
        <p className="text-sm font-black uppercase tracking-widest text-red-200">HGN closed beta</p>
        <h1 className="mt-3 text-5xl font-black">Help test the new HGN website</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-100">We are getting the Haida Gwaii News digital platform ready for beta. Join the tester list to help check stories, local utilities, community submissions, mobile layout and publishing workflows.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link href="/beta-status" className="rounded-xl bg-white px-5 py-3 font-black text-hgnNavy">View beta status</Link><Link href="/release-notes" className="rounded-xl border border-white/40 px-5 py-3 font-black text-white">Release notes</Link></div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="grid content-start gap-4">
          <div className="hgn-card p-6"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Tester pipeline</p><div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.active + snapshot.invited + snapshot.waiting}</div><p className="mt-2 text-sm text-slate-600">People currently signed up, invited or active in the beta list.</p></div>
          <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">What testers check</h2><ul className="mt-4 grid gap-3 text-sm font-semibold text-slate-700"><li>Homepage, article pages and mobile readability</li><li>Events, notices, tips and reader submission forms</li><li>Weather, ferry, tides and other local utility pages</li><li>Newsletter, sharing, images and Google News readiness</li></ul></div>
        </aside>

        <div className="hgn-card p-6 lg:p-8">
          <h2 className="text-3xl font-black text-hgnNavy">Join the beta list</h2>
          <p className="mt-2 text-slate-600">Use this form for trusted readers, contributors, local businesses and community organizations.</p>
          <form action={joinBeta} className="mt-6 grid gap-4">
            <label>Name<input name="full_name" required placeholder="Your name" /></label>
            <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
            <div className="grid gap-4 md:grid-cols-2"><label>Community<input name="community" placeholder="Skidegate, Masset, Daajing Giids..." /></label><label>Device you will test on<input name="device" placeholder="iPhone, Android, tablet, laptop" /></label></div>
            <label>Tester type<select name="role" defaultValue="reader"><option value="reader">Reader</option><option value="contributor">Contributor / writer</option><option value="business">Business owner</option><option value="advertiser">Advertiser</option><option value="community_org">Community organization</option><option value="other">Other</option></select></label>
            <label>What would you like to test?<input name="interests" placeholder="Mobile, events, submissions, business listings, articles..." /></label>
            <label>Notes<textarea name="notes" rows={5} placeholder="Anything the HGN team should know?" /></label>
            <button className="hgn-btn-primary">Join beta list</button>
          </form>
        </div>
      </section>
    </main>
  );
}
