import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const { data: notices } = await supabase
    .from("notices")
    .select("*")
    .eq("status", "published")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-hgnBlue">Public Notices</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Notices</h1>
          <p className="mt-2 text-slate-600">Community announcements, service updates, government notices and public notices for Haida Gwaii.</p>
        </div>
        <Link href="/submit-notice" className="rounded-full bg-hgnNavy px-5 py-3 text-sm font-black text-white">Book a notice</Link>
      </div>

      <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-black">Submit a public notice</h2>
        <p className="mt-2 text-sm leading-6">Government, legal, legislative, regulatory and required corporate notices can still be booked through HGN and require approval before publishing.</p>
        <p className="mt-3 text-sm font-bold">To book a paid public notice, contact <a className="underline" href="mailto:sales@haidagwaiinews.com">sales@haidagwaiinews.com</a> or use the notice submission form.</p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {notices?.length ? notices.map((notice) => (
          <article key={notice.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{notice.type || notice.category || "Notice"}</div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{notice.title || notice.name || "Notice"}</h2>
            <p className="mt-2 text-sm text-slate-500">{[notice.organization, notice.town || "Haida Gwaii"].filter(Boolean).join(" · ")}</p>
            <p className="mt-3 whitespace-pre-wrap text-slate-700">{notice.body || notice.message || notice.details || notice.notice}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">{notice.link_url && <a href={notice.link_url} target="_blank" rel="noreferrer" className="text-hgnBlue underline">More information</a>}{notice.attachment_url && <a href={notice.attachment_url} target="_blank" rel="noreferrer" className="text-hgnBlue underline">View attachment</a>}</div>
          </article>
        )) : <div className="rounded-2xl border bg-white p-6 text-slate-600">No published notices yet.</div>}
      </section>
    </main>
  );
}
