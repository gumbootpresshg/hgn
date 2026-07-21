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

export default function HomePoll() {
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

  if (!poll) return null

  return (
    <section className="rounded-3xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Reader Poll</p>
      <h2 className="mt-2 text-2xl font-black">{poll.question}</h2>
      {poll.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{poll.description}</p> : null}

      <div className="mt-4 grid gap-3">
        {(poll.poll_options || []).map((option) => {
          const count = votes[option.id] || 0
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

          return (
            <div key={option.id} className="rounded-2xl border p-3">
              {!voted ? (
                <button onClick={() => vote(option.id)} className="w-full text-left text-sm font-bold hover:text-hgnBlue">
                  {option.label}
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 text-sm font-bold">
                    <span>{option.label}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-hgnBlue" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{count} vote{count === 1 ? "" : "s"}</p>
                </>
              )}
            </div>
          )
        })}
      </div>

      {voted ? <p className="mt-3 text-xs font-semibold text-slate-500">{totalVotes} total vote{totalVotes === 1 ? "" : "s"}</p> : null}
      {message ? <p className="mt-3 text-sm font-semibold text-slate-600">{message}</p> : null}
    </section>
  )
}
