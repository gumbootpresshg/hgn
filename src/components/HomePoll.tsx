"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type PollOption = { id: string; label: string; sort_order?: number }
type Poll = {
  id: string
  question: string
  description?: string
  poll_options?: PollOption[]
}

type HomePollProps = {
  variant?: "home" | "community"
}

export default function HomePoll({ variant = "home" }: HomePollProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [message, setMessage] = useState("")
  const [voted, setVoted] = useState(false)

  async function loadResults(pollId: string) {
    const { data, error } = await supabase
      .from("poll_votes")
      .select("option_id")
      .eq("poll_id", pollId)

    if (error) {
      setMessage(error.message)
      return
    }

    const counts: Record<string, number> = {}
    ;(data || []).forEach((vote: any) => {
      if (vote.option_id) counts[vote.option_id] = (counts[vote.option_id] || 0) + 1
    })
    setVotes(counts)
  }

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("polls")
        .select("id,question,description,poll_options(id,label,sort_order)")
        .eq("show_on_home", true)
        .in("status", ["published", "active", "live"])
        .order("starts_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        setMessage(error.message)
        return
      }

      if (data) {
        data.poll_options = (data.poll_options || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        setPoll(data as Poll)
        await loadResults(data.id)
        setVoted(localStorage.getItem(`hgn_poll_voted_${data.id}`) === "yes")
      }
    }

    load()
  }, [])

  const totalVotes = useMemo(() => Object.values(votes).reduce((sum, value) => sum + value, 0), [votes])

  async function vote(optionId: string) {
    if (!poll) return

    const storageKey = `hgn_poll_voted_${poll.id}`
    const voterHash = localStorage.getItem("hgn_poll_hash") || crypto.randomUUID()
    localStorage.setItem("hgn_poll_hash", voterHash)

    const { error } = await supabase.from("poll_votes").insert({
      poll_id: poll.id,
      option_id: optionId,
      voter_hash: voterHash,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    localStorage.setItem(storageKey, "yes")
    setVoted(true)
    setVotes((current) => ({
      ...current,
      [optionId]: (current[optionId] || 0) + 1,
    }))
    setMessage("Thanks for voting.")
    await loadResults(poll.id)
  }

  if (!poll) {
    if (variant === "community") {
      return <p className="rounded-2xl border border-stone-300 bg-white/75 p-6 text-stone-600 shadow-sm">There is no reader poll open right now. Please check back soon.</p>
    }
    return null
  }

  const community = variant === "community"
  const home = !community

  return (
    <section className={community ? "rounded-[1.75rem] border border-stone-300 bg-white/75 p-5 shadow-[0_14px_34px_rgba(16,24,32,.08)] backdrop-blur-sm sm:p-8" : "overflow-hidden rounded-2xl border border-[#0e4361] bg-[#071f35] p-4 text-white shadow-sm sm:rounded-3xl sm:p-5"}>
      <div className={home ? "flex items-start justify-between gap-4" : undefined}>
        <div>
          <p className={community ? "newspaper-kicker text-hgnRed" : "text-[10px] font-black uppercase tracking-[0.18em] text-red-300 sm:text-[11px]"}>Reader poll</p>
          {home ? <p className="mt-1 font-serif text-2xl font-bold leading-none sm:text-3xl">Your say</p> : null}
        </div>
        {home ? <span className="rounded-full border border-white/40 px-3 py-1.5 text-[11px] font-bold text-stone-100">{voted ? "Results" : "Vote now"}</span> : null}
      </div>
      <h2 className={`max-w-[28ch] font-serif font-bold ${community ? "mt-1 text-hgnNavy text-3xl leading-[1.04] sm:text-4xl" : "mt-4 text-xl leading-[1.15] text-white sm:text-2xl"}`}>{poll.question}</h2>
      {poll.description ? <p className={`leading-6 ${community ? "mt-2 max-w-2xl text-base text-slate-600" : "mt-2 text-sm text-stone-200"}`}>{poll.description}</p> : null}
      {home && !voted ? <p className="mt-2 text-xs text-stone-300">Choose one answer to see the results.</p> : null}

      <div className={`grid ${community ? "mt-6 gap-2.5" : "mt-4 gap-2"}`}>
        {(poll.poll_options || []).map((option) => {
          const count = votes[option.id] || 0
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

          return (
            <div key={option.id} className={community ? "rounded-xl border border-stone-300 bg-[#fffefa]/80 px-3 py-2.5 transition hover:border-hgnBlue" : "rounded-xl bg-white/10 px-3 py-2.5 transition hover:bg-white/20 sm:rounded-2xl"}>
              {!voted ? (
                <button onClick={() => vote(option.id)} className={`flex w-full items-center gap-3 text-left text-sm font-bold leading-5 focus:outline-none focus:ring-2 focus:ring-hgnBlue/50 ${home ? "text-white" : "py-2.5 text-hgnNavy hover:text-hgnBlue"}`}>
                  {home ? <span className="h-4 w-4 shrink-0 rounded-full border-2 border-red-200" aria-hidden="true" /> : null}
                  <span>{option.label}</span>
                </button>
              ) : (
                <>
                  <div className={`flex items-center justify-between gap-3 text-sm font-bold ${home ? "text-white" : ""}`}>
                    <span>{option.label}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className={`mt-2 h-1.5 overflow-hidden ${home ? "bg-white/20" : "bg-stone-200"}`}>
                    <div className="h-full bg-hgnRed" style={{ width: `${percent}%` }} />
                  </div>
                  <p className={`mt-1 text-xs ${home ? "text-stone-300" : "text-slate-500"}`}>{count} vote{count === 1 ? "" : "s"}</p>
                </>
              )}
            </div>
          )
        })}
      </div>

      {voted ? <p className={`mt-3 text-xs font-semibold ${home ? "text-stone-300" : "text-slate-500"}`}>{totalVotes} total vote{totalVotes === 1 ? "" : "s"}</p> : null}
      {message ? <p className={`mt-3 text-sm font-semibold ${home ? "text-red-100" : "text-slate-600"}`} role="status">{message}</p> : null}
    </section>
  )
}
