import Link from "next/link"

const connections = [
  ["News lead", "Article draft", "/admin/articles", "Creates an unpublished draft with the source and desk summary attached."],
  ["Event", "Event submission draft", "/admin/events", "Creates a pending event record for staff to finish and approve."],
  ["Guide update", "Guide Keeper", "/admin/guide-keeper", "Keeps the proposed change in the review queue and links staff to the Guide workflow."],
  ["Site check", "Platform map", "/admin/platform-map", "Routes broken pages, missing fields and disconnected tools to the platform review area."],
]

export default function AiDeskConnectionsPage(){
  return <main className="mx-auto max-w-6xl space-y-7 px-6 py-10">
    <header className="rounded-3xl border bg-white p-8 shadow-sm">
      <Link href="/admin/ai-desk" className="text-sm font-black text-hgnBlue">← AI Desk</Link>
      <p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-hgnBlue">Connection audit</p>
      <h1 className="mt-2 font-serif text-5xl font-bold">Where every item goes</h1>
      <p className="mt-3 max-w-3xl text-slate-600">This map keeps the AI Desk from becoming a drawer full of interesting notes. Each supported item type has a real human-reviewed destination.</p>
    </header>
    <section className="grid gap-4">
      {connections.map(([type,destination,href,description])=><article key={type} className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_2fr_auto] md:items-center">
        <div><span className="text-xs font-black uppercase tracking-widest text-slate-400">Item type</span><strong className="mt-1 block">{type}</strong></div>
        <div><span className="text-xs font-black uppercase tracking-widest text-slate-400">Destination</span><strong className="mt-1 block">{destination}</strong></div>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
        <Link href={href} className="rounded-full border px-4 py-2 text-center text-sm font-black hover:border-hgnBlue">Open</Link>
      </article>)}
    </section>
  </main>
}
