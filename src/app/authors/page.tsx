import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { HgnAuthor } from "@/lib/writers";

export const dynamic = "force-dynamic";

export default async function AuthorsPage() {
  const { data } = await supabase
    .from("hgn_authors")
    .select("id,display_name,slug,short_bio,photo_url,writer_type,sort_order,is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("display_name", { ascending: true });

  const authors = (data || []) as HgnAuthor[];

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <div className="border-b-4 border-double border-black pb-6">
        <p className="text-sm font-black uppercase tracking-[0.2em]">Haida Gwaii News</p>
        <h1 className="mt-3 font-serif text-5xl font-black md:text-6xl">Writers</h1>
        <p className="mt-3 max-w-2xl text-lg text-stone-600">Meet the reporters, columnists and contributors behind Haida Gwaii News.</p>
      </div>

      <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <Link key={author.id} href={`/authors/${author.slug}`} className="group border-t border-stone-300 pt-5">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-stone-100">
                {author.photo_url ? <Image src={author.photo_url} alt={author.display_name} fill sizes="80px" className="object-cover" /> : <div className="grid h-full place-items-center font-serif text-3xl font-black text-stone-400">{author.display_name?.slice(0,1)}</div>}
              </div>
              <div>
                <h2 className="font-serif text-2xl font-black group-hover:underline">{author.display_name}</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">{author.writer_type || "contributor"}</p>
                {author.short_bio ? <p className="mt-2 text-sm leading-6 text-stone-600">{author.short_bio}</p> : null}
              </div>
            </div>
          </Link>
        ))}
      </section>

      {!authors.length ? <p className="mt-8 text-stone-600">Writer profiles are being prepared.</p> : null}
    </main>
  );
}
