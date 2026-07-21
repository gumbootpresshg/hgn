const printAds = [
  { type: "Business Card", dimensions: '3.5" × 2.0"', price: "$55" },
  { type: "Quarter Page", dimensions: '4.75" × 6.0"', price: "$225" },
  { type: "Banner", dimensions: '9.5" × 2.5"', price: "$200" },
  { type: "Half Page", dimensions: '9.5" × 6.0"', price: "$350" },
  { type: "Full Page", dimensions: '9.5" × 12.0"', price: "$600" },
]

const issueDates = [
  ["Jan", "1, 15, 29"],
  ["Feb", "12, 26"],
  ["March", "12, 26"],
  ["April", "9, 23"],
  ["May", "7, 21"],
  ["June", "4, 18"],
  ["July", "2, 16, 30"],
  ["Aug", "13, 27"],
  ["Sept", "10, 24"],
  ["Oct", "8, 22"],
  ["Nov", "5, 19"],
  ["Dec", "3, 17, 31"],
]

export default function AdvertisePage() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-hgnBlue">2026 Rate Card</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Advertise With Haida Gwaii News</h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">
          Island-wide reach across Haida Gwaii, trusted independent local news, ad dollars that stay local and real readers, not algorithms.
          Haida Gwaii News is distributed as a free print publication every other Thursday.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="mailto:sales@haidagwaiinews.com" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black uppercase tracking-wide text-white">Email sales@haidagwaiinews.com</a>
          <a href="tel:2505570069" className="rounded-full border px-6 py-3 text-sm font-black uppercase tracking-wide">Call 250-557-0069</a>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-black">Print Ads</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr><th className="p-4">Ad Type</th><th className="p-4">Dimensions (W × H)</th><th className="p-4">Price</th></tr>
            </thead>
            <tbody>
              {printAds.map((ad) => (
                <tr key={ad.type} className="border-t"><td className="p-4 font-black">{ad.type}</td><td className="p-4">{ad.dimensions}</td><td className="p-4 font-black text-hgnBlue">{ad.price}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-black">Website Ads</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Website ads start at <strong>$50</strong> for random placement, with front page placement available for <strong>$200</strong>.</p>
        </article>
        <article className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-black">Booking Deadline</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Booking deadlines are the Friday before publication. Contact sales to reserve space or ask about artwork requirements.</p>
        </article>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-black">2026 Issue Dates</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {issueDates.map(([month, dates]) => (
            <div key={month} className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-hgnBlue">{month}</p><p className="mt-1 text-lg font-black">{dates}</p></div>
          ))}
        </div>
      </section>
    </main>
  )
}
