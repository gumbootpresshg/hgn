import Link from "next/link"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

type CandidateProfile = { id: string; slug: string; candidate_name: string; office: string; race_name: string; community?: string | null; portrait_url?: string | null; statement: string; source_label?: string | null }

export default async function CandidateProfilesPage() {
  const { data } = await supabase.from("hgn_election_candidate_profiles").select("*").eq("published", true).order("race_name").order("sort_order").order("candidate_name")
  const profiles = (data || []) as CandidateProfile[]
  const races = Array.from(new Set(profiles.map((profile) => profile.race_name)))

  return <main className="newspaper-shell py-6 sm:py-8">
    <header className="bg-[#071f35] px-6 py-8 text-[#f4eee3] sm:px-9 sm:py-11"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-red-300">2026 local election</p><h1 className="mt-3 font-serif text-5xl font-bold leading-[.94] tracking-tight sm:text-6xl">Candidate Profiles</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-stone-200">Candidate-submitted profiles published by Haida Gwaii News. Find a candidate by community or race, then read their full statement.</p><Link href="/election" className="mt-7 inline-block border border-[#f4eee3] bg-[#f4eee3] px-4 py-3 text-sm font-bold text-stone-950">← Back to the Election Guide</Link></header>
    <section className="border-b border-stone-400 py-6"><p className="newspaper-kicker">Candidate information</p><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">These profiles are supplied by the candidates and are published for voter information. HGN has not edited them for position or endorsement.</p></section>
    {profiles.length ? races.map((race) => <section key={race} className="mt-10"><div className="newspaper-section-heading"><h2>{race}</h2><span className="text-sm font-bold text-stone-500">{profiles.filter((profile) => profile.race_name === race).length} profiles</span></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{profiles.filter((profile) => profile.race_name === race).map((profile) => <Link key={profile.id} href={`/election/candidates/${profile.slug}`} className="group border border-stone-300 bg-white p-4 transition hover:border-hgnRed"><div className="aspect-[4/3] bg-stone-100">{profile.portrait_url ? <img src={profile.portrait_url} alt={`Portrait of ${profile.candidate_name}`} className="h-full w-full object-cover"/> : <div className="flex h-full items-end bg-[#e8e3d9] p-4 font-serif text-3xl font-bold text-stone-500">{profile.candidate_name.split(" ").map((part) => part[0]).join("")}</div>}</div><p className="mt-4 newspaper-kicker">{profile.community || profile.race_name}</p><h2 className="mt-1 font-serif text-3xl font-bold group-hover:text-hgnRed">{profile.candidate_name}</h2><p className="mt-1 text-sm font-bold text-stone-600">{profile.office}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">{profile.statement}</p><p className="mt-4 text-sm font-bold text-hgnBlue">Read profile →</p></Link>)}</div></section>) : <section className="mt-10 border border-dashed border-stone-300 bg-stone-50 p-7"><h2 className="font-serif text-3xl font-bold">Profiles are being added</h2><p className="mt-2 max-w-2xl leading-7 text-stone-600">Please check back soon for candidate-submitted information.</p></section>}
  </main>
}
