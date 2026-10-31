'use client'

import { useRef, useState } from 'react'
import type { PumpkinContest, PumpkinEntry } from '@/lib/pumpkin'
import { isOpen, vancouverDate } from '@/lib/pumpkin'

export default function PumpkinCarveOff({ contest, entries, leaders }: { contest: PumpkinContest; entries: PumpkinEntry[]; leaders: PumpkinEntry[] }) {
  const entriesOpen = isOpen(contest.entry_open_at, contest.entry_close_at)
  const votingOpen = isOpen(contest.voting_open_at, contest.voting_close_at)
  const [tab, setTab] = useState<'gallery' | 'enter' | 'vote'>(entriesOpen && !entries.length ? 'enter' : 'gallery')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [voteStarted, setVoteStarted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const selection = new Set(selected)

  const choose = (id: string) => setSelected(now => now.includes(id) ? now.filter(x => x !== id) : now.length >= contest.max_votes_per_voter ? now : [...now, id])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return

    submittingRef.current = true
    setSubmitting(true)
    setMessage('Uploading your pumpkin… Please do not submit again.')

    try {
      const response = await fetch('/api/pumpkin-carve-off/submit', { method: 'POST', body: new FormData(event.currentTarget) })
      const body = await response.json()
      setMessage(response.ok ? 'Thanks — your photo is in the HGN review queue. It will appear in the gallery once approved.' : body.error || 'Could not submit your entry.')
    } catch {
      setMessage('Could not submit your pumpkin. Please try again.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  async function startVote(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch('/api/pumpkin-carve-off/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', contest_id: contest.id, entry_ids: selected, email, name }) })
    const body = await response.json()
    setMessage(body.message || body.error || '')
    if (response.ok) setVoteStarted(true)
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch('/api/pumpkin-carve-off/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify', contest_id: contest.id, email, code }) })
    const body = await response.json()
    setMessage(body.message || body.error || '')
  }

  return <>
    <div className="mt-7 flex flex-wrap gap-2">
      <button onClick={() => setTab('gallery')} className={tab === 'gallery' ? 'hgn-btn-primary' : 'rounded-full border px-5 py-3 font-bold'}>Pumpkin gallery</button>
      <button onClick={() => setTab('enter')} className={tab === 'enter' ? 'hgn-btn-primary' : 'rounded-full border px-5 py-3 font-bold'}>Enter a pumpkin</button>
      {votingOpen ? <button onClick={() => setTab('vote')} className={tab === 'vote' ? 'hgn-btn-primary' : 'rounded-full border px-5 py-3 font-bold'}>Vote for favourites</button> : null}
    </div>

    {message ? <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-950">{message}</p> : null}

    {tab === 'gallery' ? <section className="mt-7">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(entry => <article key={entry.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <img src={entry.photo_url} alt={entry.title || `Pumpkin by ${entry.display_name}`} className="aspect-square w-full object-cover" />
          <div className="p-4"><p className="text-xs font-black uppercase tracking-[.14em] text-hgnRed">{entry.community || 'Haida Gwaii'}</p><h2 className="mt-1 font-serif text-2xl font-bold">{entry.title || 'Pumpkin Carve-Off entry'}</h2><p className="mt-1 text-sm font-bold text-stone-700">By {entry.display_name}</p>{entry.description ? <p className="mt-3 text-sm leading-6 text-stone-600">{entry.description}</p> : null}</div>
        </article>)}
      </div>
      {!entries.length ? <p className="rounded-2xl border border-dashed p-8 text-stone-600">Approved pumpkins will appear here soon. Send in the first one!</p> : null}
    </section> : null}

    {tab === 'enter' ? <section className="mt-7 max-w-2xl rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="font-serif text-4xl font-bold">Enter your pumpkin</h2>
      <p className="mt-2 text-stone-600">{entriesOpen ? `Entries close ${vancouverDate(contest.entry_close_at)}. Every entry is reviewed before it appears in the gallery.` : 'Entries are currently closed.'}</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <input className="hidden" name="website" tabIndex={-1} />
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
      <div className="rounded-3xl border bg-[#10243b] p-6 text-white"><p className="newspaper-kicker text-orange-200">Choose your favourites</p><h2 className="mt-2 font-serif text-4xl font-bold">Pick up to {contest.max_votes_per_voter} pumpkins</h2><p className="mt-3 text-stone-200">Voting closes {vancouverDate(contest.voting_close_at)}. Your email confirms one ballot; it is never shown publicly.</p><p className="mt-3 text-sm font-bold text-orange-200">{selected.length} of {contest.max_votes_per_voter} selected</p></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{entries.map(entry => <button onClick={() => choose(entry.id)} key={entry.id} className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm ${selection.has(entry.id) ? 'ring-4 ring-orange-400' : ''}`}><img src={entry.photo_url} alt="" className="aspect-square w-full object-cover" /><div className="p-4"><b>{entry.title || 'Pumpkin entry'}</b><span className="mt-1 block text-sm text-stone-600">{selection.has(entry.id) ? 'Selected for your ballot' : 'Tap to select'}</span></div></button>)}</div>
      {selected.length ? <form onSubmit={voteStarted ? verify : startVote} className="mt-6 max-w-xl rounded-3xl border bg-white p-6"><h3 className="font-serif text-3xl font-bold">{voteStarted ? 'Confirm your ballot' : 'Send confirmation code'}</h3>{!voteStarted ? <><label className="mt-4 grid gap-1 font-bold">Your name <input value={name} onChange={event => setName(event.target.value)} /></label><label className="mt-4 grid gap-1 font-bold">Your email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} /></label><button className="hgn-btn-primary mt-5">Email my code</button></> : <><label className="mt-4 grid gap-1 font-bold">Six-digit code<input required inputMode="numeric" value={code} onChange={event => setCode(event.target.value)} /></label><button className="hgn-btn-primary mt-5">Confirm ballot</button></>}</form> : null}
    </section> : null}

    {votingOpen && contest.show_leaderboard && leaders.length ? <section className="mt-12 border-t border-stone-900 pt-7"><p className="newspaper-kicker text-hgnRed">Community favourites</p><h2 className="mt-2 font-serif text-4xl font-bold">Leading pumpkins</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{leaders.map((entry, index) => <article key={entry.id} className="rounded-2xl border bg-white p-3"><p className="text-xs font-black text-hgnRed">#{index + 1}</p><img src={entry.photo_url} alt="" className="mt-2 aspect-square w-full object-cover" /><p className="mt-2 font-bold">{entry.title || entry.display_name}</p></article>)}</div></section> : null}
  </>
}
