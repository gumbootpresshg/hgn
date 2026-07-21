import Link from "next/link";
import { distributionTone, distributionToneClasses, getDistributionSnapshot } from "@/lib/distribution-desk";

export const dynamic = "force-dynamic";

export default async function FollowHgnPage() {
  const snapshot = await getDistributionSnapshot();
  const publicChannels = snapshot.channels.filter((channel) => !["retired", "paused"].includes(String(channel.status || "").toLowerCase())).slice(0, 12);
  const publicRuns = snapshot.runs.filter((run) => !["cancelled", "blocked"].includes(String(run.status || "").toLowerCase())).slice(0, 6);

  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN beta</p>
      <h1 className="mt-2 text-5xl font-black">Follow HGN</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/80">Where to find HGN beta updates, newsletters, public posts, and story follow-ups as the site moves toward launch.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/newsletter" className="rounded-xl bg-white px-4 py-3 font-black text-hgnNavy">Join newsletter</Link><Link href="/beta-join" className="rounded-xl border border-white/30 px-4 py-3 font-black text-white">Join beta</Link><Link href="/submit-tip" className="rounded-xl border border-white/30 px-4 py-3 font-black text-white">Send a tip</Link></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-2">{publicChannels.map((channel) => <article key={channel.id} className={`rounded-2xl border p-5 shadow-sm ${distributionToneClasses(distributionTone(channel.status))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{channel.channel_type} · {channel.status}</div><h2 className="mt-2 text-2xl font-black">{channel.name}</h2>{channel.audience_note && <p className="mt-3 text-sm leading-6 opacity-80">{channel.audience_note}</p>}<p className="mt-4 text-sm font-black opacity-80">{channel.posting_cadence || "Updates as available"}{channel.is_primary ? " · Primary channel" : ""}</p>{channel.url && <Link href={channel.url} className="mt-4 inline-block font-black underline">Open channel</Link>}</article>)}{!publicChannels.length && <div className="rounded-2xl border bg-white p-8 text-slate-700 md:col-span-2"><h2 className="text-2xl font-black text-hgnNavy">Channels coming soon</h2><p className="mt-2">HGN follow options will appear here as beta distribution channels are confirmed.</p></div>}</section>

    <section className="mt-10 rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-3xl font-black text-hgnNavy">Current distribution focus</h2><div className="mt-5 grid gap-3">{publicRuns.map((run) => <article key={run.id} className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-widest text-slate-500">{run.publish_date} · {run.status}</div><h3 className="mt-1 text-xl font-black text-hgnNavy">{run.title}</h3>{run.summary && <p className="mt-2 text-sm leading-6 text-slate-700">{run.summary}</p>}</article>)}{!publicRuns.length && <p className="text-slate-600">No distribution runs are public yet.</p>}</div></section>
  </main>;
}
