import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPublishingSettings, formatPublishingDate } from "@/lib/publishing-settings";
import { HgnAuthor } from "@/lib/writers";
import { absoluteUrl, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };


export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { data: author } = await supabase.from("hgn_authors").select("display_name,short_bio,photo_url,is_active").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!author) return { title: `Writer | ${SITE.name}` };
  const title = `${author.display_name} | ${SITE.name}`;
  const description = author.short_bio || `Articles and reporting by ${author.display_name} for ${SITE.name}.`;
  const url = absoluteUrl(`/authors/${slug}`);
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "profile", images: author.photo_url ? [{ url: absoluteUrl(author.photo_url) }] : undefined } };
}

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  subcategory?: string | null;
  column_name?: string | null;
  published_at?: string | null;
};

export default async function AuthorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const { data: author } = await supabase
    .from("hgn_authors")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!author) notFound();
  const typedAuthor = author as HgnAuthor;

  const [{ data: articles }, { data: columns }, publishingSettings] = await Promise.all([
    supabase
      .from("articles")
      .select("id,title,slug,excerpt,category,subcategory,column_name,published_at")
      .eq("status", "published")
      .eq("writer_id", typedAuthor.id)
      .order("published_at", { ascending: false })
      .limit(100),
    supabase
      .from("columnists")
      .select("id,display_name,name,slug,description")
      .eq("author_id", typedAuthor.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    getPublishingSettings(),
  ]);

  const stories = (articles || []) as ArticleRow[];

  const personJsonLd = { "@context": "https://schema.org", "@type": "Person", name: typedAuthor.display_name, url: absoluteUrl(`/authors/${typedAuthor.slug}`), ...(typedAuthor.photo_url ? { image: absoluteUrl(typedAuthor.photo_url) } : {}), ...(typedAuthor.short_bio ? { description: typedAuthor.short_bio } : {}), worksFor: { "@type": "NewsMediaOrganization", name: SITE.name, url: SITE.url } };

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <Link href="/authors" className="text-sm font-bold uppercase tracking-wide text-stone-600 hover:underline">← All writers</Link>

      <section className="mt-6 grid gap-7 border-b-4 border-double border-black pb-8 md:grid-cols-[180px_1fr] md:items-start">
        <div className="relative h-40 w-40 overflow-hidden rounded-full bg-stone-100">
          {typedAuthor.photo_url ? <Image src={typedAuthor.photo_url} alt={typedAuthor.display_name} fill sizes="160px" className="object-cover" priority /> : <div className="grid h-full place-items-center font-serif text-6xl font-black text-stone-400">{typedAuthor.display_name?.slice(0,1)}</div>}
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em]">{typedAuthor.writer_type || "Writer"}</p>
          <h1 className="mt-2 font-serif text-5xl font-black md:text-6xl">{typedAuthor.display_name}</h1>
          {typedAuthor.short_bio ? <p className="mt-4 text-xl leading-8 text-stone-700">{typedAuthor.short_bio}</p> : null}
          {typedAuthor.bio ? <p className="mt-4 whitespace-pre-line leading-7 text-stone-600">{typedAuthor.bio}</p> : null}
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            {typedAuthor.public_email ? <a href={`mailto:${typedAuthor.public_email}`} className="hover:underline">Email</a> : null}
            {typedAuthor.website_url ? <a href={typedAuthor.website_url} target="_blank" rel="noreferrer" className="hover:underline">Website</a> : null}
          </div>
          {(columns || []).length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {(columns || []).map((column: any) => <Link key={column.id} href={`/columns/${column.slug}`} className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-bold hover:bg-stone-100">{column.display_name || column.name}</Link>)}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between border-b border-black pb-3">
          <h2 className="font-serif text-3xl font-black">Articles by {typedAuthor.display_name}</h2>
          <span className="text-sm text-stone-500">{stories.length} article{stories.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y divide-stone-200">
          {stories.map((article) => (
            <article key={article.id} className="py-6">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">{article.column_name || article.subcategory || article.category || "News"}</p>
              <Link href={`/articles/${article.slug}`}><h3 className="mt-2 font-serif text-3xl font-black leading-tight hover:underline">{article.title}</h3></Link>
              {article.excerpt ? <p className="mt-3 max-w-3xl leading-7 text-stone-600">{article.excerpt}</p> : null}
              {article.published_at ? <p className="mt-3 text-xs font-bold uppercase tracking-wide text-stone-500">{formatPublishingDate(article.published_at, publishingSettings)}</p> : null}
            </article>
          ))}
        </div>
        {!stories.length ? <p className="py-8 text-stone-600">No published articles are linked to this writer yet.</p> : null}
      </section>
    </main>
  );
}
