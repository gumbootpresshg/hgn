import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const { data: notices } = await supabase
    .from("notices")
    .select("*")
    .in("status", ["approved", "published"])
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-hgnBlue">Public Notices</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Notices</h1>
          <p className="mt-2 text-slate-600">Paid legal, government, legislative, regulatory and required corporate notices for Haida Gwaii. Public Notices are $100 per month online and require approval before publishing.</p>
        </div>
        <Link href="/submit-notice" className="rounded-full bg-hgnNavy px-5 py-3 text-sm font-black text-white">Book a notice</Link>
      </div>

      <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-black">Public Notice submissions</h2>
        <p className="mt-2 text-sm leading-6">Notices are for government, legal, legislative, regulatory and required corporate/public postings. They are not for regular community posters or general announcements.</p>
        <p className="mt-3 text-sm font-bold">Rate: $100 per month online. Approval is required before publishing. To book, contact <a className="underline" href="mailto:sales@haidagwaiinews.com">sales@haidagwaiinews.com</a> or call <a className="underline" href="tel:2505570069">250-557-0069</a>.</p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {notices?.length ? notices.map((notice) => (
          <article key={notice.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{notice.type || "Notice"}</div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{notice.title || notice.name || "Notice"}</h2>
            <p className="mt-2 text-sm text-slate-500">{notice.town || "Haida Gwaii"}</p>
            <p className="mt-3 text-slate-700">{notice.message || notice.details || notice.notice}</p>
          </article>
        )) : <div className="rounded-2xl border bg-white p-6 text-slate-600">No published notices yet.</div>}
      </section>
    </main>
  );
}
