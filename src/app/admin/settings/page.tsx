import Link from "next/link"

const settings = [
  ["Newsletter settings", "/admin/newsletter", "Automatic or manual production, schedule, sections and test sends."],
  ["Guide Keeper", "/admin/guide-keeper", "Official source checks, review queue and tourist-season freshness."],
  ["Square & integrations", "/admin/integrations", "Connected payment data and historical synchronization."],
  ["Reports & exports", "/admin/reports", "Bookkeeping, taxes, government-support and internal reporting files."],
  ["App readiness", "/admin/app-readiness", "Track the stable foundation required for iOS and Android."],
  ["Platform map", "/admin/platform-map", "See the core tools connected to each role-based workspace."],
]

export default function Page() {
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6"><section className="rounded-3xl border bg-white p-8 shadow-sm"><p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Publisher settings</p><h1 className="mt-3 font-serif text-5xl font-bold">Platform settings</h1><p className="mt-3 max-w-3xl text-slate-600">The main controls and system checks are gathered here. Detailed publishing work remains in its own desk.</p></section><section className="grid gap-4 md:grid-cols-2">{settings.map(([label,href,copy])=><Link key={href} href={href} className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue"><strong className="text-xl">{label}</strong><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></Link>)}</section></main>
}
