const checks = [
  ["Homepage", "Hero story, images, events button, ad/support CTA, mobile layout"],
  ["Articles", "Imported stories render cleanly, images show or fallback, category links work"],
  ["Letters", "Published letters show and submit letter flow works"],
  ["Opinion/Columnists", "Dropdowns work and columns land in the correct section"],
  ["Events", "Calendar/list view, submit event, editor approval"],
  ["Classifieds", "Marketplace, jobs, notices, realty, vehicles/boats"],
  ["Obituaries", "Read page and submit/contact flow"],
  ["Weather", "Town weather, marine, tides, emergency info"],
  ["Games", "No dead pages; coming soon is polished when needed"],
  ["Admin", "Edit articles, upload image, publish, set front page main story"],
  ["Ads", "Ad slots click to Advertise page, expiry dates work"],
  ["Mobile", "No scrollbars, menu works, forms easy to use"],
];

export default function LaunchChecklistPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Beta launch</p>
      <h1 className="mt-2 text-4xl font-black text-hgnNavy">HGN test checklist</h1>
      <p className="mt-3 text-slate-700">Use this page when showing the owner/editor and when testing before Vercel deployment.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {checks.map(([title, body]) => (
          <div key={title} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
