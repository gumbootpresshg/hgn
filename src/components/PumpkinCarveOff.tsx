'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PumpkinContest, PumpkinEntry } from '@/lib/pumpkin'
import { isOpen, vancouverDate } from '@/lib/pumpkin'

function SharePumpkinButton({ entry, onShare }: { entry: PumpkinEntry; onShare: (entry: PumpkinEntry) => void }) {
  return <button type="button" onClick={() => onShare(entry)} className="mt-4 inline-flex rounded-full border border-stone-300 px-3 py-2 text-sm font-bold text-stone-800 hover:border-hgnRed hover:text-hgnRed">Share this pumpkin ↗</button>
}

export default function PumpkinCarveOff({ contest, entries, leaders }: { contest: PumpkinContest; entries: PumpkinEntry[]; leaders: PumpkinEntry[] }) {
  const router = useRouter()
  const entriesOpen = isOpen(contest.entry_open_at, contest.entry_close_at)
  const votingOpen = isOpen(contest.voting_open_at, contest.voting_close_at)
  const resultsVisible = contest.status === 'results' || Boolean(
    contest.voting_close_at && new Date(contest.voting_close_at).getTime() <= Date.now()
  )
  const [tab, setTab] = useState<'enter' | 'vote' | 'top10' | 'results'>(
    resultsVisible ? 'results' : votingOpen ? 'vote' : entriesOpen ? 'enter' : 'results'
  )
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const submittingRef = useRef(false)
  const submissionTokenRef = useRef(typeof crypto === 'undefined' ? '' : crypto.randomUUID())
  const voterTokenRef = useRef('')
  const selection = new Set(selected)

  const choose = (id: string) => setSelected(now => now.includes(id) ? now.filter(x => x !== id) : now.length >= contest.max_votes_per_voter ? now : [...now, id])

  async function sharePumpkin(entry: PumpkinEntry) {
    const url = `${window.location.origin}/pumpkin-carve-off/${entry.id}`
    const title = entry.title || 'A pumpkin in the Great Haida Gwaii Pumpkin Carve-Off'
    const text = `Check out "${title}" in the Great Haida Gwaii Pumpkin Carve-Off and cast your vote!`

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setMessage('Share link copied — paste it into Facebook, Instagram, text, or email.')
        return
      }
      window.prompt('Copy this pumpkin link:', url)
    } catch (error) {
      if ((error as { name?: string })?.name !== 'AbortError') setMessage('Could not open sharing. Please try again.')
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return

    submittingRef.current = true
    setSubmitting(true)
    setMessage('Uploading your pumpkin… Please do not submit again.')

    try {
      const form = new FormData(event.currentTarget)
      form.set('submission_token', submissionTokenRef.current)
      const response = await fetch('/api/pumpkin-carve-off/submit', { method: 'POST', body: form })
      const body = await response.json()
      if (response.ok) {
        setMessage('Thanks — your photo is in the HGN review queue. It will appear in the gallery once approved.')
        event.currentTarget.reset()
        submissionTokenRef.current = crypto.randomUUID()
      } else {
        setMessage(body.error || 'Could not submit your entry.')
      }
    } catch {
      setMessage('Could not submit your pumpkin. Please try again.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const key = `hgn-pumpkin-ballot-${contest.id}`
    const saved = window.localStorage.getItem(key)
    if (saved) {
      voterTokenRef.current = saved
      setHasVoted(true)
      return
    }
    voterTokenRef.current = crypto.randomUUID()
  }, [contest.id])

  async function castVote() {
    if (!selected.length || voting || hasVoted) return
    setVoting(true)
    const voterToken = voterTokenRef.current || crypto.randomUUID()
    voterTokenRef.current = voterToken

    try {
      const response = await fetch('/api/pumpkin-carve-off/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contest_id: contest.id, entry_ids: selected, voter_token: voterToken }),
      })
      const body = await response.json()
      setMessage(body.message || body.error || '')
      if (response.ok) {
        window.localStorage.setItem(`hgn-pumpkin-ballot-${contest.id}`, voterToken)
        setHasVoted(true)
        router.refresh()
      }
    } catch {
      setMessage('Could not save your ballot. Please try again.')
    } finally {
      setVoting(false)
    }
  }

  return <>
    <div className="mt-7 flex flex-wrap gap-2">
      {entriesOpen ? <button onClick={() => setTab('enter')} className={tab === 'enter' ? 'hgn-btn-primary' : 'rounded-full border px-5 py-3 font-bold'}>Enter a pumpkin</button> : null}
      {votingOpen ? <button onClick={() => setTab('vote')} className={tab === 'vote' ? 'hgn-btn-primary' : 'rounded-full border px-5 py-3 font-bold'}>Vote for pumpkins</button> : null}
      {votingOpen ? <button onClick={() => setTab('top10')} className={tab === 'top10' ? 'hgn-btn-primary' : 'rounded-full border px-5 py-3 font-bold'}>Top 10</button> : null}
      {resultsVisible ? <button onClick={() => setTab('results')} className={tab === 'results' ? 'hgn-btn-primary' : 'rounded-full border px-5 py-3 font-bold'}>2026 Results</button> : null}
    </div>

    {message ? <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-950">{message}</p> : null}



    {tab === 'enter' ? <section className="mt-7 max-w-2xl rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="font-serif text-4xl font-bold">Enter your pumpkin</h2>
      <p className="mt-2 text-stone-600">{entriesOpen ? `Entries close ${vancouverDate(contest.entry_close_at)}. Every entry is reviewed before it appears in the gallery.` : 'Entries are currently closed.'}</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <input className="hidden" name="website" tabIndex={-1} />
        <input type="hidden" name="submission_token" />
        <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1 font-bold">Your name / family name<input required name="display_name" /></label><label className="grid gap-1 font-bold">Community<input name="community" placeholder="e.g. Masset" /></label></div>
        <label className="grid gap-1 font-bold">Email <span className="font-normal text-stone-500">(not public)</span><input required name="email" type="email" /></label>
        <label className="grid gap-1 font-bold">Phone <span className="font-normal text-stone-500">(optional, not public)</span><input name="phone" /></label>
        <label className="grid gap-1 font-bold">Pumpkin title <span className="font-normal text-stone-500">(optional)</span><input name="title" placeholder="e.g. The Haunted Lighthouse" /></label>
        <label className="grid gap-1 font-bold">Tell us about it <span className="font-normal text-stone-500">(optional)</span><textarea name="description" rows={3} /></label>
        <label className="grid gap-1 font-bold">Pumpkin photo<input required name="photo" type="file" accept="image/jpeg,image/png,image/webp" /></label>
        <p className="text-sm leading-6 text-stone-600">{contest.rules}</p>
        <button disabled={!entriesOpen || submitting} className="hgn-btn-primary disabled:opacity-50">{!entriesOpen ? 'Entries closed' : submitting ? 'Uploading…' : 'Submit pumpkin'}</button>
      </form>
    </section> : null}

    {votingOpen && tab === 'vote' ? <section className="mt-7">
      <div className="rounded-3xl border bg-[#10243b] p-6 text-white">
        <p className="newspaper-kicker text-orange-200">Voting rules</p>
        <h2 className="mt-2 font-serif text-4xl font-bold">Pick up to {contest.max_votes_per_voter} pumpkins</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-stone-100"><li>Choose up to {contest.max_votes_per_voter} different pumpkins, then cast one ballot.</li><li>No email, name, account, or sign-in is needed.</li><li>Each browser can cast one ballot. Shared Wi-Fi can submit up to five ballots for the contest.</li><li>Please keep it fair: do not use extra browsers, networks, or automated voting.</li></ol>
        <p className="mt-4 text-sm font-bold text-orange-200">{selected.length} of {contest.max_votes_per_voter} selected · Voting closes {vancouverDate(contest.voting_close_at)}</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(entry => <article id={`pumpkin-${entry.id}`} key={entry.id} className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-sm ${selection.has(entry.id) ? 'ring-4 ring-orange-400' : ''}`}>
          <button type="button" onClick={() => choose(entry.id)} className="block w-full text-left"><img src={entry.photo_url} alt="" className="aspect-square w-full object-cover" /><div className="p-4"><b>{entry.title || 'Pumpkin entry'}</b><span className="mt-1 block text-sm text-stone-600">{selection.has(entry.id) ? 'Selected for your ballot' : 'Tap to select'}</span></div></button>
          <div className="px-4 pb-4"><SharePumpkinButton entry={entry} onShare={sharePumpkin} /></div>
        </article>)}
      </div>
      {hasVoted ? <p className="mt-6 max-w-xl rounded-3xl border border-emerald-200 bg-emerald-50 p-6 font-bold text-emerald-900">Your ballot from this browser has been counted. Thanks for taking part!</p> : selected.length ? <section className="mt-6 max-w-xl rounded-3xl border bg-white p-6"><h3 className="font-serif text-3xl font-bold">Ready to vote?</h3><p className="mt-2 text-stone-600">No email or sign-in needed. You can cast one ballot from this browser.</p><button disabled={voting} onClick={() => void castVote()} className="hgn-btn-primary mt-5 disabled:opacity-50">{voting ? 'Casting your votes…' : 'Cast my votes'}</button></section> : null}
    </section> : null}

    {votingOpen && tab === 'top10' ? <section className="mt-7"><p className="newspaper-kicker text-hgnRed">Community favourites</p><h2 className="mt-2 font-serif text-4xl font-bold">Top 10 pumpkins</h2><p className="mt-2 text-stone-600">Current leaders, updated as ballots come in.</p>{leaders.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{leaders.slice(0, 10).map((entry, index) => <article id={`pumpkin-${entry.id}`} key={entry.id} className="scroll-mt-24 rounded-2xl border bg-white p-3"><p className="text-xs font-black text-hgnRed">#{index + 1}</p><img src={entry.photo_url} alt="" className="mt-2 aspect-square w-full object-cover" /><p className="mt-2 font-bold">{entry.title || entry.display_name}</p><p className="mt-1 text-sm font-bold text-hgnRed">{entry.votes === 1 ? '1 vote' : `${entry.votes || 0} votes`}</p><SharePumpkinButton entry={entry} onShare={sharePumpkin} /></article>)}</div> : <p className="mt-5 rounded-2xl border border-dashed p-8 text-stone-600">Votes are just getting started. Check back soon for the first Top 10.</p>}</section> : null}

    {resultsVisible && tab === 'results' ? <section className="mt-7"><p className="newspaper-kicker text-hgnRed">The Great Haida Gwaii Pumpkin Carve-Off</p><h2 className="mt-2 font-serif text-4xl font-bold">2026 Final Results</h2><p className="mt-2 max-w-2xl text-stone-600">Voting has closed. Here are the final standings for every approved pumpkin entered in the 2026 contest. Thanks to everyone who carved, entered and voted.</p>{leaders.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{leaders.map((entry, index) => <article id={`pumpkin-${entry.id}`} key={entry.id} className="scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="relative"><img src={entry.photo_url} alt={entry.title || 'Pumpkin entry'} className="aspect-square w-full object-cover" /><p className="absolute left-3 top-3 rounded-full bg-stone-950 px-3 py-1 text-sm font-black text-white">#{index + 1}</p></div><div className="p-4"><p className="font-bold">{entry.title || entry.display_name}</p><p className="mt-1 text-sm font-bold text-hgnRed">{entry.votes === 1 ? '1 vote' : `${entry.votes || 0} votes`}</p><SharePumpkinButton entry={entry} onShare={sharePumpkin} /></div></article>)}</div> : <p className="mt-5 rounded-2xl border border-dashed p-8 text-stone-600">Final results are being prepared.</p>}</section> : null}
  </>
}
