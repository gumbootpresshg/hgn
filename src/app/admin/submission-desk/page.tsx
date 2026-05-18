import Link from "next/link";

export const dynamic = "force-dynamic";

const desks = [
  ["Articles", "/admin/articles", "Edit, publish and feature newsroom stories."],
  ["Events", "/events", "Review event submissions and promote the calendar."],
  ["Notices", "/notices", "Review legal, government, legislative, regulatory and required corporate notices."],
  ["Obituaries", "/obituaries", "Review obituary submissions and contact families."],
  ["Ads", "/admin/ads", "Manage ad placements, dates and links."],
  ["Accounting", "/admin/accounting", "Track ad requests, Square links and payment status."],
  ["Subscribers", "/admin/subscribers", "Newsletter and audience list."],
  ["Staff Room", "/staff-room", "Planning, contributor notes and newsroom chat."],
];

export default function SubmissionDesk(){return <main className="mx-auto max-w-7xl px-4 py-10"><div className="border-b pb-6"><p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Admin</p><h1 className="text-4xl font-black text-hgnNavy">Submission Desk</h1><p className="mt-2 text-slate-600">Fast links for editors to manage what readers, contributors and advertisers send in.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{desks.map(([title,href,desc])=><Link key={href} href={href} className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue"><h2 className="text-xl font-black text-hgnNavy">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p></Link>)}</div></main>}
