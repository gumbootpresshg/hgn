import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ContributorRemindersPage() {
  const { data: commitments } = await supabase
    .from("contributor_commitments")
    .select("*")
    .order("issue_date", { ascending: true })
    .limit(100);

  const { data: contributors } = await supabase
    .from("user_roles")
    .select("email,role")
    .in("role", ["contributor", "editor", "admin"])
    .order("email", { ascending: true });

  const subject = encodeURIComponent("Haida Gwaii News contributor reminder");
  const body = encodeURIComponent("Hi,Please let us know what you plan to submit for the upcoming edition: half page, full page, column, photos, or other material. You can also add your plan in the HGN Staff Room.Thanks,Haida Gwaii News");

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="border-b pb-6">
        <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Admin / Editor</div>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Contributor Reminders</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          Track who is submitting what and quickly send reminder emails. Automated email delivery can be connected later with Resend, SendGrid or Square/customer workflows.
        </p>
        <div className="mt-4 flex gap-2"><Link href="/staff-room" className="hgn-btn-primary">Staff Room</Link><Link href="/admin" className="hgn-btn-dark">Command Centre</Link></div>
      </div>

      <section className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        <aside className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Send reminders</h2>
          <div className="mt-4 grid gap-3">
            {(contributors || []).map((c: any) => (
              <a key={c.email} href={`mailto:${c.email}?subject=${subject}&body=${body}`} className="rounded-xl bg-slate-50 p-3 font-bold text-hgnNavy hover:bg-sky-50">
                {c.email}<span className="ml-2 text-xs uppercase text-hgnBlue">{c.role}</span>
              </a>
            ))}
            {!(contributors || []).length && <p className="text-slate-600">No contributors found yet. Add contributor roles in admin invites/user roles.</p>}
          </div>
        </aside>

        <div className="grid gap-4">
          {(commitments || []).map((c: any) => (
            <article key={c.id} className="hgn-card p-5">
              <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{c.status || "planned"}</div>
              <h2 className="mt-1 text-2xl font-black text-hgnNavy">{c.title || c.submission_type || "Contributor submission"}</h2>
              <p className="mt-1 text-sm text-slate-500">{c.contributor_name || c.contributor_email || "Contributor"} {c.issue_date ? `· Issue ${c.issue_date}` : ""}</p>
              <p className="mt-3 text-slate-700"><b>Type:</b> {c.submission_type || "Not specified"}</p>
              {c.notes && <p className="mt-2 whitespace-pre-wrap text-slate-700">{c.notes}</p>}
            </article>
          ))}
          {!(commitments || []).length && <div className="hgn-card p-8 text-slate-600">No commitments yet.</div>}
        </div>
      </section>
    </main>
  );
}
