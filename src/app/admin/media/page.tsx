export default function AdminMediaPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Admin
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Article Media</h1>
        <p className="mt-3 text-slate-600">
          Upload article photos from the article editor. Images are stored in the
          Supabase Storage bucket <strong>hgn-media</strong>.
        </p>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Best online photo settings</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
          <li>Use WebP or compressed JPG when possible.</li>
          <li>Keep article images under 10MB before upload.</li>
          <li>Use landscape images for lead story photos.</li>
          <li>Always add alt text for accessibility and SEO.</li>
          <li>Add captions and photo credit when available.</li>
        </ul>
      </section>
    </main>
  )
}
