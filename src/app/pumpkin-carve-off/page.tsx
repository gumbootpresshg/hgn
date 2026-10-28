import { serviceClient } from '@/lib/newsletters/server'
import PumpkinCarveOff from '@/components/PumpkinCarveOff'
import type { PumpkinContest, PumpkinEntry } from '@/lib/pumpkin'
import { absoluteUrl, SITE } from '@/lib/site'

export const metadata = {
  title: 'The Great Haida Gwaii Pumpkin Carve-Off',
  description: 'Enter a carved pumpkin in the Haida Gwaii News Halloween contest, then vote for the island favourites.',
  alternates: { canonical: absoluteUrl('/pumpkin-carve-off') },
  openGraph: {
    title: 'The Great Haida Gwaii Pumpkin Carve-Off',
    description: 'Enter your pumpkin and vote for island favourites.',
    url: absoluteUrl('/pumpkin-carve-off'),
    siteName: SITE.name,
    images: [{ url: absoluteUrl('/pumpkin-carve-off-2026-banner.webp'), width: 1920, height: 1080, alt: 'A carved pumpkin glowing on a porch at dusk' }],
  },
}
export const dynamic='force-dynamic'
export default async function Page(){const db=serviceClient();const {data:contest}=await db.from('hgn_pumpkin_contests').select('*').in('status',['entries','voting','results']).order('created_at',{ascending:false}).limit(1).maybeSingle();if(!contest)return <main className="newspaper-shell py-12"><h1 className="font-serif text-5xl font-bold">Pumpkin Carve-Off</h1><p className="mt-4 text-stone-600">The next Great Haida Gwaii Pumpkin Carve-Off is being prepared.</p></main>;const {data:entries}=await db.from('hgn_pumpkin_entries').select('*').eq('contest_id',contest.id).eq('status','approved').order('featured',{ascending:false}).order('created_at',{ascending:false});const ids=(entries||[]).map(x=>x.id);const {data:votes}=ids.length?await db.from('hgn_pumpkin_votes').select('entry_id').in('entry_id',ids):{data:[] as any[]};const count=new Map<string,number>();(votes||[]).forEach((v:any)=>count.set(v.entry_id,(count.get(v.entry_id)||0)+1));const all=(entries||[]).map((e:any)=>({...e,votes:count.get(e.id)||0})) as PumpkinEntry[];const leaders=[...all].sort((a,b)=>(b.votes||0)-(a.votes||0)).slice(0,contest.leaderboard_size);return <main className="newspaper-shell py-7"><header className="border-b border-stone-900 pb-7"><p className="newspaper-kicker text-hgnRed">Haida Gwaii News presents</p><h1 className="mt-2 font-serif text-5xl font-bold tracking-tight sm:text-6xl">{contest.title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{contest.intro}</p></header><PumpkinCarveOff contest={contest as PumpkinContest} entries={all} leaders={leaders}/></main>}
