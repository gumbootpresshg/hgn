import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/newsletters/server'

const clean = (value: FormDataEntryValue | null, length: number) => String(value || '').trim().slice(0, length)

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    if (clean(form.get('website'), 120)) return NextResponse.json({ ok: true })

    const display_name = clean(form.get('display_name'), 100)
    const email = clean(form.get('email'), 254).toLowerCase()
    const file = form.get('photo') as File | null
    const submission_token = clean(form.get('submission_token'), 80)

    if (!display_name || !/^\S+@\S+\.\S+$/.test(email) || !file?.size) {
      return NextResponse.json({ error: 'Your name, email and pumpkin photo are required.' }, { status: 400 })
    }
    if (file.size > 12 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Use a JPG, PNG or WebP photo under 12 MB.' }, { status: 400 })
    }
    if (!/^[a-z0-9-]{20,80}$/i.test(submission_token)) {
      return NextResponse.json({ error: 'Please refresh the page and try your submission again.' }, { status: 400 })
    }

    const db = serviceClient()
    const { data: contest } = await db.from('hgn_pumpkin_contests').select('*').in('status', ['entries', 'voting']).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!contest) return NextResponse.json({ error: 'Entries are not open right now.' }, { status: 403 })

    const now = Date.now()
    if (!contest.entry_open_at || !contest.entry_close_at || now < new Date(contest.entry_open_at).getTime() || now >= new Date(contest.entry_close_at).getTime()) {
      return NextResponse.json({ error: 'The entry window is not open right now.' }, { status: 403 })
    }

    // An email may submit more than one pumpkin. The one-time form token makes
    // retrying the same upload safe without turning a household into a one-entry limit.
    const { data: existing, error: existingError } = await db
      .from('hgn_pumpkin_entries')
      .select('id')
      .eq('contest_id', contest.id)
      .eq('submission_token', submission_token)
      .maybeSingle()
    if (existingError) throw existingError
    if (existing) return NextResponse.json({ ok: true, duplicate: true })

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
    const path = `pumpkin-carve-off/${contest.slug}/${crypto.randomUUID()}.${ext}`
    const upload = await db.storage.from('hgn-media').upload(path, file, { contentType: file.type, upsert: false })
    if (upload.error) throw upload.error

    const photo_url = db.storage.from('hgn-media').getPublicUrl(path).data.publicUrl
    const { error } = await db.from('hgn_pumpkin_entries').insert({
      contest_id: contest.id,
      display_name,
      community: clean(form.get('community'), 80) || null,
      title: clean(form.get('title'), 120) || null,
      description: clean(form.get('description'), 600) || null,
      contact_email: email,
      contact_phone: clean(form.get('phone'), 40) || null,
      submission_token,
      photo_url,
    })
    if (error) {
      // A rapid network retry can lose the pre-insert check; the unique index
      // remains the final guard against creating a second copy of this upload.
      if ((error as { code?: string }).code === '23505') return NextResponse.json({ ok: true, duplicate: true })
      throw error
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not submit your pumpkin.' }, { status: 500 })
  }
}
