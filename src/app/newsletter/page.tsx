"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { recordHgnAnalyticsEvent } from "@/components/analytics/analytics-events"

type Product = { slug: string; name: string; description?: string; frequency?: string; featured?: boolean }

export default function NewsletterPage() {
  const [config, setConfig] = useState<any>(null)
  const [chosen, setChosen] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [signedUp, setSignedUp] = useState(false)

  useEffect(() => {
    fetch("/api/newsletters/public-config", { cache: "no-store" })
      .then(response => response.json())
      .then(result => {
        const products: Product[] = result.products || []
        setConfig(result)
        setChosen(products.filter(product => product.featured).map(product => product.slug) || [])
        if (!products.filter(product => product.featured).length && products[0]) setChosen([products[0].slug])
      })
      .catch(() => {
        setConfig({ products: [], page: {} })
        setMessage("Newsletter signup is temporarily unavailable.")
      })
  }, [])

  const page = config?.page || {}
  const products: Product[] = config?.products || []
  const configLoaded = config !== null
  const oneNewsletter = products.length === 1
  const selectedProducts = useMemo(() => oneNewsletter && products[0] ? [products[0].slug] : chosen, [chosen, oneNewsletter, products])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    setSignedUp(false)
    const form = new FormData(event.currentTarget)
    const response = await fetch("/api/newsletters/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(form.get("email") || ""), name: String(form.get("name") || ""), products: selectedProducts }),
    })
    const result = await response.json()
    if (response.ok) {
      setSignedUp(true)
      recordHgnAnalyticsEvent("newsletter_signup", { pagePath: "/newsletter", source: "newsletter_page" })
      setMessage(result.welcome?.sent ? (page.success_message || "You’re on the list. Check your inbox for a welcome email.") : (result.welcome?.reason || page.success_message || "You’re on the list."))
      event.currentTarget.reset()
    } else setMessage(result.error || "Could not save your signup.")
    setBusy(false)
  }

  function toggle(slug: string) {
    setChosen(current => current.includes(slug) ? current.filter(value => value !== slug) : [...current, slug])
  }

  return <main className="min-h-[64vh] bg-[radial-gradient(circle_at_top_right,_rgba(30,95,148,.11),_transparent_31rem)]">
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-hgnNavy bg-gradient-to-br from-[#10243b] via-hgnNavy to-hgnBlue text-white shadow-[0_18px_45px_rgba(16,36,59,.2)] md:grid md:grid-cols-[1fr_280px]">
        <div className="p-7 sm:p-10"><p className="text-xs font-bold uppercase tracking-[.24em] text-sky-200">HGN Email</p><h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">{page.headline || "Get the HGN Update"}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-100">{page.intro || "Free biweekly local news, events and island information from Haida Gwaii News."}</p></div>
        {page.image_url ? <img src={page.image_url} alt="" className="h-full min-h-48 w-full object-cover" /> : <div className="hidden bg-[linear-gradient(145deg,rgba(255,255,255,.16),transparent)] md:block" />}
      </section>

      <section className="mx-auto mt-8 max-w-xl">
        <form onSubmit={submit} className="grid gap-5 rounded-[1.75rem] border border-stone-300 bg-white/85 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div><p className="newspaper-kicker text-hgnRed">Free newsletter</p><h2 className="mt-2 font-serif text-3xl font-bold text-hgnNavy">Get the HGN Update</h2><p className="mt-2 leading-7 text-slate-600">{page.signup_explanation || "Local stories and community information, delivered every other week. Unsubscribe anytime."}</p></div>
          {message ? <div className={`rounded-2xl border p-4 font-semibold ${signedUp ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-red-200 bg-red-50 text-red-800"}`} role="status">{message}</div> : null}
          {signedUp ? <div className="rounded-2xl border border-stone-300 bg-[#f4f0e8] p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-hgnBlue">Community supported</p><h3 className="mt-2 font-serif text-2xl font-bold text-hgnNavy">Keep HGN free for everyone.</h3><p className="mt-2 leading-7 text-slate-700">Reader support helps sustain independent local reporting, island information and the print paper. Supporting HGN is always optional.</p><Link href="/support" className="mt-4 inline-flex rounded-full bg-hgnNavy px-5 py-3 text-sm font-bold text-white hover:bg-hgnBlue">Support HGN</Link></div> : null}
          <label>Name<input name="name" autoComplete="name" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          {!oneNewsletter && products.length > 1 ? <fieldset className="grid gap-3 rounded-2xl border border-stone-300 p-4"><legend className="px-2 font-bold text-hgnNavy">Newsletter choices</legend>{products.map(product => <label key={product.slug} className="flex items-start gap-3 rounded-xl p-2 hover:bg-slate-50"><input className="mt-1 w-auto" type="checkbox" checked={chosen.includes(product.slug)} onChange={() => toggle(product.slug)} /><span><span className="font-bold">{product.name}</span>{product.frequency ? <span className="ml-2 text-sm text-slate-500">{product.frequency}</span> : null}{product.description ? <span className="mt-1 block text-sm text-slate-600">{product.description}</span> : null}</span></label>)}</fieldset> : null}
          {configLoaded && !products.length ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No newsletters are accepting new subscriptions right now.</p> : null}
          <button disabled={busy || !configLoaded || !products.length || !selectedProducts.length} className="hgn-btn-primary min-h-12">{busy ? "Saving…" : page.button_text || "Get the HGN Update"}</button>
          <p className="text-center text-xs leading-5 text-slate-500">Free biweekly update. Unsubscribe any time.</p>
        </form>
        {page.advertising_cta_text && page.advertising_cta_url ? <div className="mt-6 text-center"><a className="font-bold text-hgnBlue underline underline-offset-4" href={page.advertising_cta_url}>{page.advertising_cta_text}</a></div> : null}
        {page.footer_note ? <p className="mt-4 text-center text-sm text-slate-600">{page.footer_note}</p> : null}
      </section>
    </div>
  </main>
}
