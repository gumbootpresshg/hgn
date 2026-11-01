import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serviceClient } from '@/lib/newsletters/server'
import { absoluteUrl, SITE } from '@/lib/site'

type PageProps = { params: Promise<{ id: string }> }

async function getPumpkin(id: string) {
  const db = serviceClient()
  const { data } = await db
    .from('hgn_pumpkin_entries')
    .select('id,contest_id,display_name,community,title,description,photo_url,status,hgn_pumpkin_contests!inner(title,slug)')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle()
  return data as any
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const pumpkin = await getPumpkin(id)
  if (!pumpkin) return { title: 'Pumpkin Carve-Off | ' + SITE.name }

  const contestTitle = pumpkin.hgn_pumpkin_contests?.title || 'The Great Haida Gwaii Pumpkin Carve-Off'
  const pumpkinTitle = pumpkin.title || ('Pumpkin by ' + pumpkin.display_name)
  const title = 'Vote for ' + pumpkinTitle + ' | ' + contestTitle
  const description = [pumpkin.description, 'Created by ' + pumpkin.display_name, pumpkin.community].filter(Boolean).join(' · ')
  const url = absoluteUrl('/pumpkin-carve-off/' + pumpkin.id)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: SITE.name, images: [{ url: pumpkin.photo_url, alt: pumpkinTitle }] },
    twitter: { card: 'summary_large_image', title, description, images: [pumpkin.photo_url] },
  }
}

export const dynamic = 'force-dynamic'

export default async function PumpkinSharePage({ params }: PageProps) {
  const { id } = await params
  const pumpkin = await getPumpkin(id)
  if (!pumpkin) notFound()

  const contestTitle = pumpkin.hgn_pumpkin_contests?.title || 'The Great Haida Gwaii Pumpkin Carve-Off'
  const pumpkinTitle = pumpkin.title || 'Pumpkin Carve-Off entry'

  return <main className="newspaper-shell py-10">
    <p className="newspaper-kicker text-hgnRed">{contestTitle}</p>
    <section className="mt-3 grid max-w-4xl gap-7 md:grid-cols-2">
      <img src={pumpkin.photo_url} alt={pumpkinTitle} className="aspect-square w-full rounded-3xl object-cover shadow-sm" />
      <div className="flex flex-col justify-center">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-hgnRed">{pumpkin.community || 'Haida Gwaii'}</p>
        <h1 className="mt-2 font-serif text-5xl font-bold">{pumpkinTitle}</h1>
        <p className="mt-3 text-lg font-bold text-stone-700">By {pumpkin.display_name}</p>
        {pumpkin.description ? <p className="mt-5 text-lg leading-8 text-stone-600">{pumpkin.description}</p> : null}
        <Link href={'/pumpkin-carve-off#pumpkin-' + pumpkin.id} className="hgn-btn-primary mt-7 w-fit">View gallery and vote</Link>
      </div>
    </section>
  </main>
}
