export default function LaunchOpsPage() {
  const priorities = [
    'Lead story freshness',
    'Homepage mobile check',
    'Image caption + alt text review',
    'Breaking update scan',
    'Newsletter + social distribution'
  ];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Launch Operations Hub</h1>
        <p className="mt-2 text-sm opacity-80">
          One consolidated daily workflow for the admin/editor beta period.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {priorities.map((item) => (
          <article key={item} className="rounded-xl border p-4">
            <h2 className="font-semibold">{item}</h2>
            <p className="mt-2 text-sm opacity-75">
              Daily operational checkpoint before public publishing.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
