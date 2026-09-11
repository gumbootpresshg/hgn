import Link from "next/link";
import { getStoryboardSnapshot, storyboardTone, storyboardToneClasses } from "@/lib/storyboard";

export const dynamic = "force-dynamic";

export default async function StoryboardPublicPage() {
  const snapshot = await getStoryboardSnapshot();
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <div className="rounded-3xl bg-hgnNavy p-8 text-white"><p className="text-sm font-black uppercase tracking-widest text-white/70">HGN Planning</p><h1 className="mt-2 text-4xl font-black">Storyboard</h1><p className="mt-3 max-w-2xl text-white/80">A simple view of upcoming newsroom focus areas during the two-person beta workflow.</p><Link href="/" className="mt-5 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-black text-hgnNavy">Back home</Link></div>
    <section className="mt-8 grid gap-4 md:grid-cols-2">{snapshot.activeItems.slice(0, 12).map((item) => <article key={item.id} className={`rounded-2xl border p-5 ${storyboardToneClasses(storyboardTone(item.workflow_state, item.priority_level, item.needs_photo, item.needs_source_check))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.workflow_state} · {item.story_type}</div><h2 className="mt-2 text-xl font-black">{item.story_title}</h2>{item.target_window && <p className="mt-2 text-sm font-bold">Target: {item.target_window}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}</article>)}</section>
  </main>;
}
