import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

type CandidateProfile = { candidate_name: string; office: string; race_name: string; community?: string | null; portrait_url?: string | null; statement: string; source_label?: string | null }

export default async function CandidateProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase.from("hgn_election_candidate_profiles").select("*").eq("slug", slug).eq("published", true).maybeSingle()
  const profile = data as CandidateProfile | null
  if (!profile) notFound()
  return <main className="newspaper-shell py-6 sm:py-8"><Link href="/election/candidates" className="text-sm font-bold text-hgnBlue hover:text-hgnRed">← All candidate profiles</Link><article className="mt-5 border-y border-stone-400 py-7 sm:grid sm:grid-cols-[minmax(220px,.72fr)_minmax(0,1.28fr)] sm:gap-9"><div><div className="aspect-[4/5] bg-stone-100">{profile.portrait_url ? <img src={profile.portrait_url} alt={`Portrait of ${profile.candidate_name}`} className="h-full w-full object-cover"/> : <div className="flex h-full items-end bg-[#e8e3d9] p-5 font-serif text-5xl font-bold text-stone-500">{profile.candidate_name.split(" ").map((part) => part[0]).join("")}</div>}</div></div><div className="mt-6 sm:mt-0"><p className="newspaper-kicker text-hgnRed">{profile.race_name}</p><h1 className="mt-2 font-serif text-5xl font-bold leading-[.95] tracking-tight sm:text-6xl">{profile.candidate_name}</h1><p className="mt-4 text-lg font-bold text-stone-700">{profile.office}{profile.community ? ` · ${profile.community}` : ""}</p><div className="mt-7 border-l-4 border-hgnRed pl-5"><p className="text-sm font-bold uppercase tracking-wide text-stone-500">Candidate-submitted profile</p><div className="mt-4 whitespace-pre-line text-lg leading-8 text-stone-800">{profile.statement}</div></div>{profile.source_label ? <p className="mt-7 text-sm text-stone-500">Source: {profile.source_label}</p> : null}</div></article></main>
}
