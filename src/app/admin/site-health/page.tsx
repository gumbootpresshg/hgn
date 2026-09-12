import Link from "next/link"

const checks = [
  { href: "/admin/submission-shield", label: "Submission Shield", description: "Review form-abuse and submission protection checks." },
  { href: "/admin/submission-inbox-guard", label: "Submission Inbox Guard", description: "Review intake reliability and inbox protection checks." },
  { href: "/admin/moderation-desk", label: "Trust & Safety", description: "Open moderation and policy review tools." },
  { href: "/admin/platform-map", label: "Platform Map", description: "Review connected public tools and routes." },
  { href: "/admin/app-readiness", label: "App Readiness", description: "Review public API and mobile-app readiness." },
]

export default function SiteHealthPage() {
  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
    <section className="rounded-3xl border bg-white p-7 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">Platform</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">Site Health</h1>
      <p className="mt-3 max-w-3xl text-slate-600">Security, intake reliability and platform diagnostics live here. These are support tools, not daily newsroom inboxes.</p>
    </section>

    <section className="grid gap-4 md:grid-cols-2">
      {checks.map(item => <Link key={item.href} href={item.href} className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md">
        <h2 className="text-xl font-black">{item.label}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
        <span className="mt-4 inline-block text-sm font-black text-hgnBlue">Open →</span>
      </Link>)}
    </section>
  </main>
}
