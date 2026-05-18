import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdSlot from "@/components/AdSlot";

export const revalidate = 60;

export default async function VisitorListingPage({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("visitor_listings")
    .select("*")
    .eq("slug", params.slug)
    .in("status", ["approved", "published"])
    .maybeSingle();

  if (!data) notFound();

  return <main className="mx-auto max-w-5xl px-4 py-10">
    <Link href="/visitor-guide" className="text-sm font-black text-hgnBlue">← Visitor Guide</Link>
    <article className="mt-5 overflow-hidden rounded-3xl border bg-white shadow-sm">
      {data.image_url && <img src={data.image_url} alt="" className="max-h-[420px] w-full object-cover" />}
      <div className="p-6 md:p-10">
        <div className="text-xs font-black uppercase tracking-widest text-hgnBlue">{data.category} • {data.town}</div>
        <h1 className="mt-2 text-4xl font-black leading-tight text-hgnNavy md:text-6xl">{data.title}</h1>
        <p className="mt-6 whitespace-pre-wrap text-lg leading-8 text-slate-700">{data.description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {data.address && <Info label="Address / Area" value={data.address} />}
          {data.hours && <Info label="Hours / Notes" value={data.hours} />}
          {data.phone && <a className="hgn-card p-4 font-black text-hgnNavy" href={`tel:${data.phone}`}><span className="block text-xs uppercase text-slate-500">Phone</span>{data.phone}</a>}
          {data.email && <a className="hgn-card p-4 font-black text-hgnNavy" href={`mailto:${data.email}`}><span className="block text-xs uppercase text-slate-500">Email</span>{data.email}</a>}
          {data.website && <a className="hgn-btn-primary md:col-span-2" href={data.website} target="_blank">Open website / booking link</a>}
        </div>
      </div>
    </article>
    <section className="mt-8"><AdSlot placement="visitor_listing_bottom" /></section>
  </main>
}
function Info({ label, value }: { label: string; value: string }) { return <div className="hgn-card p-4"><span className="block text-xs font-black uppercase text-slate-500">{label}</span><b className="text-hgnNavy">{value}</b></div>; }
