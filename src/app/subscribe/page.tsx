const subscriptions = [
  { name: "Haida Gwaii Residents", price: "$130", description: "Annual print subscription for readers on Haida Gwaii." },
  { name: "Off-Island Residents", price: "$150", description: "Annual print subscription for readers outside Haida Gwaii." },
]

export default function SubscribePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Print Subscriptions</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Subscribe to Haida Gwaii News</h1>
        <p className="mt-4 max-w-3xl text-slate-600">Subscribe to the print edition by eTransfer or cheque. For help, contact sales@haidagwaiinews.com.</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {subscriptions.map((tier) => (
          <article key={tier.name} className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">{tier.name}</h2>
            <p className="mt-3 text-5xl font-black text-hgnBlue">{tier.price}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{tier.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border bg-slate-50 p-6 text-sm leading-7 text-slate-700">
        <h2 className="text-2xl font-black text-slate-950">How to Pay</h2>
        <p className="mt-4"><strong>eTransfer:</strong> sales@haidagwaiinews.com</p>
        <p className="mt-2"><strong>Cheque:</strong> Haida Gwaii News, PO Box 22, Tlell, BC V0T 1Y0</p>
        <p className="mt-2"><strong>Questions:</strong> <a href="mailto:sales@haidagwaiinews.com" className="font-bold text-hgnBlue">sales@haidagwaiinews.com</a></p>
      </section>
    </main>
  )
}
