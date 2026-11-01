import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/newsletters/server'

const MAX_BALLOTS_PER_IP = 5
const cleanToken = (value: unknown) => String(value || '').trim()
const validToken = (value: string) => /^[a-z0-9-]{20,80}$/i.test(value)

async function hashIp(contestId: string, request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for')
  if (!ip) return null

  // The database receives a one-way HMAC-style fingerprint, never the raw address.
  const pepper = process.env.PUMPKIN_VOTE_IP_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || 'hgn-pumpkin-vote'
  const bytes = new TextEncoder().encode(`${pepper}:${contestId}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const contestId = String(body.contest_id || '')
    const voterToken = cleanToken(body.voter_token)
    const ids = [...new Set(Array.isArray(body.entry_ids) ? body.entry_ids.map(String) : [])]

    if (!validToken(voterToken) || !ids.length) {
      return NextResponse.json({ error: 'Choose at least one pumpkin, then try again.' }, { status: 400 })
    }

    const db = serviceClient()
    const { data: contest } = await db.from('hgn_pumpkin_contests').select('*').eq('id', contestId).single()
    if (!contest) return NextResponse.json({ error: 'Competition not found.' }, { status: 404 })
    if (!contest.voting_open_at || !contest.voting_close_at || Date.now() < new Date(contest.voting_open_at).getTime() || Date.now() >= new Date(contest.voting_close_at).getTime()) {
      return NextResponse.json({ error: 'Voting is not open right now.' }, { status: 403 })
    }
    if (ids.length > contest.max_votes_per_voter) {
      return NextResponse.json({ error: `Choose up to ${contest.max_votes_per_voter} pumpkins.` }, { status: 400 })
    }

    const { data: valid } = await db.from('hgn_pumpkin_entries').select('id').eq('contest_id', contestId).eq('status', 'approved').in('id', ids)
    if ((valid || []).length !== ids.length) return NextResponse.json({ error: 'One of those entries is no longer available.' }, { status: 400 })

    const ipHash = await hashIp(contestId, request)
    if (!ipHash) return NextResponse.json({ error: 'We could not verify this connection. Please refresh and try again.' }, { status: 400 })

    const { data: existingToken, error: existingTokenError } = await db
      .from('hgn_pumpkin_ballots').select('id').eq('contest_id', contestId).eq('voter_token', voterToken).maybeSingle()
    if (existingTokenError) throw existingTokenError
    if (existingToken) return NextResponse.json({ error: 'This browser has already submitted a ballot.' }, { status: 409 })

    const { count, error: countError } = await db
      .from('hgn_pumpkin_ballots').select('id', { count: 'exact', head: true }).eq('contest_id', contestId).eq('ip_hash', ipHash)
    if (countError) throw countError
    if ((count || 0) >= MAX_BALLOTS_PER_IP) {
      return NextResponse.json({ error: 'This internet connection has reached the contest voting limit.' }, { status: 429 })
    }

    const { data: ballot, error: ballotError } = await db.from('hgn_pumpkin_ballots').insert({
      contest_id: contestId,
      voter_token: voterToken,
      ip_hash: ipHash,
      verified_at: new Date().toISOString(),
    }).select('id').single()
    if (ballotError) {
      if ((ballotError as { code?: string }).code === '23505') return NextResponse.json({ error: 'This browser has already submitted a ballot.' }, { status: 409 })
      throw ballotError
    }

    const { error: votesError } = await db.from('hgn_pumpkin_votes').insert(ids.map(entry_id => ({ ballot_id: ballot.id, entry_id })))
    if (votesError) throw votesError

    return NextResponse.json({ ok: true, message: 'Your votes are in — thank you for taking part!' })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not save your ballot.' }, { status: 500 })
  }
}
