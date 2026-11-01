import { NextRequest, NextResponse } from 'next/server'
import { requirePublisher } from '@/lib/newsletters/server'

const clean = (value: any, length: number) => String(value || '').trim().slice(0, length)
const statuses = ['draft', 'entries', 'voting', 'results', 'archived']

function timestamp(value: unknown) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function contestRow(body: any) {
  const entryOpen = timestamp(body.entry_open_at)
  const entryClose = timestamp(body.entry_close_at)
  const votingOpen = timestamp(body.voting_open_at)
  const votingClose = timestamp(body.voting_close_at)
  if ([entryOpen, entryClose, votingOpen, votingClose].includes(undefined)) return { error: 'One of the schedule dates is invalid. Please choose the date and time again.' }
  if (entryOpen && entryClose && new Date(entryOpen) >= new Date(entryClose)) return { error: 'Entry closing time must be after entry opening time.' }
  if (votingOpen && votingClose && new Date(votingOpen) >= new Date(votingClose)) return { error: 'Voting closing time must be after voting opening time.' }

  return {
    row: {
      slug: clean(body.slug || `pumpkin-carve-off-${new Date().getFullYear()}`, 90),
      title: clean(body.title, 180) || 'The Great Haida Gwaii Pumpkin Carve-Off',
      intro: clean(body.intro, 800),
      rules: clean(body.rules, 2000),
      entry_open_at: entryOpen, entry_close_at: entryClose, voting_open_at: votingOpen, voting_close_at: votingClose,
      max_votes_per_voter: Math.max(1, Math.min(10, Number(body.max_votes_per_voter) || 5)),
      show_leaderboard: Boolean(body.show_leaderboard),
      leaderboard_size: Math.max(1, Math.min(20, Number(body.leaderboard_size) || 10)),
      status: statuses.includes(body.status) ? body.status : 'draft',
    },
  }
}

export async function GET(req: NextRequest) {
  const access = await requirePublisher(req)
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const { data: contests, error } = await access.db.from('hgn_pumpkin_contests').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const ids = (contests || []).map(contest => contest.id)
  const { data: entries } = ids.length ? await access.db.from('hgn_pumpkin_entries').select('*').in('contest_id', ids).order('created_at', { ascending: false }) : { data: [] }
  return NextResponse.json({ contests: contests || [], entries: entries || [] })
}

export async function POST(req: NextRequest) {
  const access = await requirePublisher(req)
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const body = await req.json().catch(() => ({}))
  const parsed = contestRow(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { data, error } = await access.db.from('hgn_pumpkin_contests').insert(parsed.row).select().single()
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ contest: data })
}

export async function PATCH(req: NextRequest) {
  const access = await requirePublisher(req)
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const body = await req.json().catch(() => ({}))

  if (body.kind === 'entry') {
    const { error } = await access.db.from('hgn_pumpkin_entries').update({ status: ['pending', 'approved'].includes(body.status) ? body.status : 'pending', featured: Boolean(body.featured), reviewed_at: new Date().toISOString() }).eq('id', body.id)
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true })
  }

  const id = String(body.id || '')
  if (!id) return NextResponse.json({ error: 'Missing competition.' }, { status: 400 })
  const parsed = contestRow(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { data, error } = await access.db.from('hgn_pumpkin_contests').update({ ...parsed.row, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ contest: data })
}

export async function DELETE(req: NextRequest) {
  const access = await requirePublisher(req)
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing entry.' }, { status: 400 })
  const { data: entry, error: findError } = await access.db.from('hgn_pumpkin_entries').select('id,photo_url').eq('id', id).maybeSingle()
  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 })
  if (!entry) return NextResponse.json({ error: 'Entry not found.' }, { status: 404 })
  const { error } = await access.db.from('hgn_pumpkin_entries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const marker = '/hgn-media/'
  const path = String(entry.photo_url || '').split(marker)[1]
  if (path?.startsWith('pumpkin-carve-off/')) await access.db.storage.from('hgn-media').remove([decodeURIComponent(path)])
  return NextResponse.json({ ok: true })
}
