import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type PageProps = { params: Promise<{ subcategory: string }> };

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  author?: string | null;
  author_name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  column_name?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

const routeLabels: Record<string, string> = {
  "on-the-record": "On the Record",
  editorials: "Editorials",
  columns: "Columns",
  "guest-opinion": "Guest Opinion",
  "letters-to-the-editor": "Letters to the Editor",
};

function slugToLabel(slug: string) {
  return routeLabels[slug] || slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function clean(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function excerpt(article: Article) {
  return (
    article.excerpt ||
    article.body?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220) ||
    ""
  );
}

function displayDate(value?: string | null) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { subcategory } = await params;
  const label = slugToLabel(subcategory);
  return {
    title: `${label} | Opinion | Haida Gwaii News`,
    description: `${label} articles from Haida Gwaii News.`,
    alternates: { canonical: `/opinion/${subcategory}` },
  };
}

export default async function OpinionSubcategoryPage({ params }: PageProps) {
  const { subcategory } = await params;
  const label = slugToLabel(subcategory);
  const target = clean(label);

  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,body,author,author_name,category,subcategory,column_name,published_at,created_at,status")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return (
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p>
      </main>
    );
  }

  const articles = (data || []).filter((article: any) => {
    const values = [article.subcategory, article.category, article.column_name, article.title, article.slug]
      .map((value) => clean(String(value || "")));
    return values.some((value) => value === target || value.includes(target));
  }) as Article[];

  if (!articles.length && !routeLabels[subcategory]) notFound();

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Opinion</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">{label}</h1>
        <p className="mt-3 text-slate-600">Latest {label} articles from Haida Gwaii News.</p>
      </section>

      {articles.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">No articles found yet.</p>
      ) : (
        <section className="space-y-4">
          {articles.map((article) => (
            <article key={article.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <Link href={`/articles/${article.slug}`} className="text-2xl font-bold hover:underline">
                {article.title}
              </Link>
              <p className="mt-2 text-sm text-slate-500">
                {article.author_name || article.author || "Haida Gwaii News"}
                {article.published_at || article.created_at ? ` · ${displayDate(article.published_at || article.created_at)}` : ""}
              </p>
              <p className="mt-3 text-slate-600">{excerpt(article)}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
