import Link from "next/link";
import { getLaunchCommsSnapshot } from "@/lib/launch-comms";

export const dynamic = "force-dynamic";

export default async function BetaUpdatesPage() {
  const snapshot = await getLaunchCommsSnapshot();
  const publicUpdates = snapshot.updates.filter((post) => String(post.visibility || "") === "public" && ["approved", "published"].includes(String(post.status || ""))).slice(0, 20);
  const knownIssues = publicUpdates.filter((post) => String(post.category || "") === "known-issue");

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN Beta</p>
        <h1 className="mt-2 text-5xl font-black">Beta Updates</h1>
        <p className="mt-3 max-w-3xl text-white/80">What changed, what is being tested, and what still needs attention before HGN moves out of beta.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Link href="/beta-feedback" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-hgnNavy">Send feedback</Link><Link href="/beta-status" className="rounded-xl border border-white/30 px-4 py-2 text-sm font-black text-white">Status page</Link></div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Public notes</div><div className="mt-2 text-4xl font-black text-hgnNavy">{publicUpdates.length}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Known issues</div><div className="mt-2 text-4xl font-black text-hgnNavy">{knownIssues.length}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Release notes</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.releases.length}</div></div>
      </section>

      <section className="mt-8 grid gap-4">
        {publicUpdates.map((post) => (
          <article key={post.id} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-widest text-hgnBlue">{post.category || "update"}{post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString()}` : ""}</div>
            <h2 className="mt-2 text-2xl font-black text-hgnNavy">{post.title}</h2>
            {post.summary && <p className="mt-2 font-semibold text-slate-700">{post.summary}</p>}
            {post.body && <p className="mt-3 whitespace-pre-wrap text-slate-700">{post.body}</p>}
          </article>
        ))}
        {!publicUpdates.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No public beta updates have been approved yet.</p>}
      </section>
    </main>
  );
}
