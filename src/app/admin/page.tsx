import Link from "next/link"

const sections = [
  {
    title: "Publishing",
    links: [
      { href: "/admin/articles", label: "Articles" },
      { href: "/admin/pages", label: "Pages" },
      { href: "/admin/events", label: "Events" },
      { href: "/admin/obituaries", label: "Obituaries" },
      { href: "/admin/island-lens", label: "Island Lens" },
      { href: "/admin/polls", label: "Polls" },
    ],
  },
  {
    title: "Audience & Revenue",
    links: [
      { href: "/admin/marketplace", label: "Marketplace" },
      { href: "/admin/members", label: "Members" },
      { href: "/admin/subscriptions", label: "Subscriptions" },
      { href: "/admin/business-directory", label: "Business Directory" },
      { href: "/admin/newsletter", label: "Newsletters" },
    ],
  },
  {
    title: "Operations",
    links: [
      { href: "/admin/ads", label: "Ad Manager" },
      { href: "/admin/columns", label: "Columns Menu" },
      { href: "/admin/settings", label: "Settings" },
      { href: "/explore", label: "Explore Haida Gwaii" },
      { href: "/explore/live", label: "Live Utilities" },
    ],
  },
]

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Publisher Dashboard</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Admin</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Manage the unified HGN platform: publishing, members, subscriptions, marketplace, business directory, events, Island Lens, polls and settings.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">{section.title}</h2>
            <div className="mt-5 grid gap-3">
              {section.links.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-2xl border px-4 py-3 text-sm font-bold hover:border-hgnBlue hover:text-hgnBlue">
                  {link.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
