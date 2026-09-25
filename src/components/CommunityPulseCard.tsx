import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default async function CommunityPulseCard() {
  const { data: poll } = await supabase
    .from("polls")
    .select("id,question,description,poll_options(id,label,sort_order)")
    .eq("show_on_home", true)
    .in("status", ["published", "active", "live"])
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!poll) return null

  const options = (poll.poll_options || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">Community Pulse</div>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{poll.question}</h2>
      {poll.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{poll.description}</p> : null}
      <div className="mt-4 grid gap-2">
        {options.map((option) => (
          <div key={option.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            {option.label}
          </div>
        ))}
      </div>
      <Link href="/community-pulse" className="mt-4 inline-block text-sm font-black text-hgnBlue hover:underline">Vote and see results →</Link>
    </section>
  )
}
