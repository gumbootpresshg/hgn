import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { officialColumnNames, slugify } from "@/lib/article-routing";

export const dynamic = "force-dynamic";

export default async function ColumnsPage() {
  const { data } = await supabase
    .from("columnists")
    .select("id,display_name,name,slug,description,author_id,is_active,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("display_name", { ascending: true });

  const databaseColumns = (data || []).map((row: any) => ({
    id: row.id,
    name: row.display_name || row.name,
    slug: row.slug,
    description: row.description,
  })).filter((row: any) => row.name && row.slug);

  const columns = databaseColumns.length
    ? databaseColumns
    : officialColumnNames.map((name) => ({ id: slugify(name), name, slug: slugify(name), description: null }));

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">Opinion</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Columns</h1>
        <p className="mt-3 text-slate-600">Recurring columns and voices from Haida Gwaii News.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {columns.map((column: any) => (
          <Link key={column.id} href={`/columns/${column.slug}`} className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
            <h2 className="text-xl font-black">{column.name}</h2>
            {column.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{column.description}</p> : null}
            <p className="mt-3 text-sm font-bold text-hgnBlue">View this column →</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
