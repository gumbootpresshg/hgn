'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

async function headers() {
  const { data } = await supabase.auth.getSession()
  return { Authorization: `Bearer ${data.session?.access_token || ''}`, 'Content-Type': 'application/json' }
}

const blank = {
  slug: `pumpkin-carve-off-${new Date().getFullYear()}`,
  title: 'The Great Haida Gwaii Pumpkin Carve-Off',
  intro: 'Show us your best pumpkin creation, then help choose the island favourites.',
  rules: 'One entry per household. By submitting, you confirm that HGN may display the photo for this competition.',
  entry_open_at: '', entry_close_at: '', voting_open_at: '', voting_close_at: '',
  max_votes_per_voter: 5, show_leaderboard: true, leaderboard_size: 10, status: 'draft',
}

// B.C. now uses permanent Pacific Time (PCT), UTC−7. Do not depend on
// a device's America/Vancouver timezone data, which can lag this 2026 change.
const PCT_OFFSET_MS = 7 * 60 * 60 * 1000

function pacificInput(value: string | null | undefined) {
  if (!value) return ''
  const local = new Date(new Date(value).getTime() - PCT_OFFSET_MS)
  const pad = (number: number) => String(number).padStart(2, '0')
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`
}

function iso(value: string) {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  return new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00-07:00`).toISOString()
}

function savedTime(value: string | null | undefined) {
  if (!value) return 'not set'
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Etc/GMT+7', dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(value))
}

export default function AdminPumpkin() {
  const [contests, setContests] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [form, setForm] = useState<any>(blank)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function select(contest: any) {
    setForm({
      ...contest,
      entry_open_at: pacificInput(contest.entry_open_at),
      entry_close_at: pacificInput(contest.entry_close_at),
      voting_open_at: pacificInput(contest.voting_open_at),
      voting_close_at: pacificInput(contest.voting_close_at),
    })
  }

  async function load(selectFirst = false) {
    try {
      const response = await fetch('/api/admin/pumpkin-carve-off', { headers: await headers(), cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || 'Could not load competition.')
        return
      }
      setContests(data.contests || [])
      setEntries(data.entries || [])
      if (selectFirst && data.contests?.[0]) select(data.contests[0])
    } catch {
      setMessage('Could not load competition.')
    }
  }

  useEffect(() => { void load(true) }, [])

  async function save() {
    setSaving(true)
    setMessage('')
    const payload = {
      ...form,
      entry_open_at: iso(form.entry_open_at),
      entry_close_at: iso(form.entry_close_at),
      voting_open_at: iso(form.voting_open_at),
      voting_close_at: iso(form.voting_close_at),
    }

    try {
      const response = await fetch('/api/admin/pumpkin-carve-off', {
        method: form.id ? 'PATCH' : 'POST',
        headers: await headers(),
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || 'Could not save competition.')
        return
      }
      if (data.contest) select(data.contest)
      setMessage(`Competition saved. Voting opens ${savedTime(data.contest?.voting_open_at)} and closes ${savedTime(data.contest?.voting_close_at)} (Pacific Time, PCT / UTC−7).`)
      await load(false)
    } catch {
      setMessage('Could not save competition. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function review(entry: any, status: string, featured = entry.featured) {
    const response = await fetch('/api/admin/pumpkin-carve-off', { method: 'PATCH', headers: await headers(), body: JSON.stringify({ kind: 'entry', id: entry.id, status, featured }) })
    const data = await response.json()
    setMessage(response.ok ? 'Entry updated.' : data.error || 'Could not update entry.')
    if (response.ok) await load(false)
  }

  async function remove(entry: any) {
    if (!window.confirm(`Delete ${entry.title || 'this pumpkin entry'}? This cannot be undone.`)) return
    const response = await fetch(`/api/admin/pumpkin-carve-off?id=${encodeURIComponent(entry.id)}`, { method: 'DELETE', headers: await headers() })
    const data = await response.json()
    setMessage(response.ok ? 'Entry deleted.' : data.error || 'Could not delete entry.')
    if (response.ok) await load(false)
  }

  const visibleEntries = entries.filter(entry => (!form.id || entry.contest_id === form.id) && ['pending', 'approved'].includes(entry.status))

  return <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
    <header className="rounded-3xl bg-[#10243b] p-7 text-white"><p className="newspaper-kicker text-orange-200">Community competition</p><h1 className="mt-2 font-serif text-5xl font-bold">Pumpkin Carve-Off</h1><p className="mt-3 max-w-3xl text-stone-200">Set the season windows, review submitted pumpkin photos, and control the public leaders display.</p></header>
    {message ? <p className="rounded-xl border bg-amber-50 p-4">{message}</p> : null}
    <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <aside className="rounded-2xl border bg-white p-5"><button onClick={() => setForm(blank)} className="hgn-btn-primary w-full">New competition</button><div className="mt-4 grid gap-2">{contests.map(contest => <button key={contest.id} onClick={() => select(contest)} className={`rounded-xl border p-3 text-left ${form.id === contest.id ? 'border-hgnBlue bg-blue-50' : ''}`}><b>{contest.title}</b><span className="mt-1 block text-xs uppercase text-slate-500">{contest.status}</span></button>)}</div></aside>
      <section className="rounded-2xl border bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2"><label>Title<input value={form.title || ''} onChange={event => setForm({ ...form, title: event.target.value })} /></label><label>URL ending<input value={form.slug || ''} onChange={event => setForm({ ...form, slug: event.target.value })} /></label></div>
        <label className="mt-4 block">Intro<textarea rows={3} value={form.intro || ''} onChange={event => setForm({ ...form, intro: event.target.value })} /></label>
        <label className="mt-4 block">Rules<textarea rows={3} value={form.rules || ''} onChange={event => setForm({ ...form, rules: event.target.value })} /></label>
        <p className="mt-4 text-sm font-bold text-slate-700">All schedule times are Pacific Time (PCT, UTC−7), year-round.</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-2"><label>Entries open<input type="datetime-local" value={form.entry_open_at || ''} onChange={event => setForm({ ...form, entry_open_at: event.target.value })} /></label><label>Entries close<input type="datetime-local" value={form.entry_close_at || ''} onChange={event => setForm({ ...form, entry_close_at: event.target.value })} /></label><label>Voting opens<input type="datetime-local" value={form.voting_open_at || ''} onChange={event => setForm({ ...form, voting_open_at: event.target.value })} /></label><label>Voting closes<input type="datetime-local" value={form.voting_close_at || ''} onChange={event => setForm({ ...form, voting_close_at: event.target.value })} /></label></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3"><label>Status<select value={form.status || 'draft'} onChange={event => setForm({ ...form, status: event.target.value })}>{['draft', 'entries', 'voting', 'results', 'archived'].map(status => <option key={status}>{status}</option>)}</select></label><label>Votes per person<input type="number" min="1" max="10" value={form.max_votes_per_voter || 5} onChange={event => setForm({ ...form, max_votes_per_voter: event.target.value })} /></label><label>Leader cards<input type="number" min="1" max="20" value={form.leaderboard_size || 10} onChange={event => setForm({ ...form, leaderboard_size: event.target.value })} /></label></div>
        <label className="mt-4 flex gap-2"><input type="checkbox" checked={!!form.show_leaderboard} onChange={event => setForm({ ...form, show_leaderboard: event.target.checked })} />Show live leaders on public page</label>
        <div className="mt-5 flex gap-3"><button disabled={saving} onClick={() => void save()} className="hgn-btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Save competition'}</button><a className="rounded-full border px-5 py-3 font-bold" href="/pumpkin-carve-off" target="_blank">Open public page</a></div>
      </section>
    </section>
    <section><div className="flex items-end justify-between"><div><p className="newspaper-kicker text-hgnRed">Review queue</p><h2 className="mt-1 font-serif text-4xl font-bold">Pending and approved pumpkins</h2></div><p className="text-sm text-slate-600">{visibleEntries.length} shown</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleEntries.map(entry => <article key={entry.id} className="overflow-hidden rounded-2xl border bg-white"><img src={entry.photo_url} alt="" className="aspect-square w-full object-cover" /><div className="p-4"><p className="text-xs font-black uppercase text-hgnRed">{entry.status}{entry.featured ? ' · featured' : ''}</p><h3 className="mt-1 font-serif text-2xl font-bold">{entry.title || 'Pumpkin entry'}</h3><p className="text-sm text-stone-600">{entry.display_name} · {entry.community || 'Haida Gwaii'}<br />{entry.contact_email}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void review(entry, 'approved')} className="rounded-full bg-green-700 px-3 py-2 text-xs font-bold text-white">Approve</button><button onClick={() => void remove(entry)} className="rounded-full bg-red-700 px-3 py-2 text-xs font-bold text-white">Delete</button><button onClick={() => void review(entry, entry.status, !entry.featured)} className="rounded-full border px-3 py-2 text-xs font-bold">{entry.featured ? 'Unfeature' : 'Feature'}</button></div></div></article>)}</div>{!visibleEntries.length ? <p className="mt-5 rounded-2xl border border-dashed p-6 text-slate-600">Submitted pumpkins will arrive here for approval.</p> : null}</section>
  </main>
}
