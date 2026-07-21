import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold text-blue-300">← PuckScope</Link>
        <p className="mt-10 text-sm uppercase tracking-[0.3em] text-blue-300">Privacy Policy</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-6 text-zinc-400">Last updated: April 27, 2026</p>
        <div className="mt-10 space-y-6 text-sm leading-7 text-zinc-300">
          <p>PuckScope collects information users choose to submit, including account email addresses, player profile submissions, scouting notes saved to an account, article or contributor inquiries, and contact details included in forms.</p>
          <p>Information is used to operate the site, manage accounts, review profile claims, publish approved content, improve tools, and communicate with users about PuckScope-related requests.</p>
          <p>Player profile submissions and claimed profile details are reviewed before public display. Do not submit private information that should not appear publicly.</p>
          <p>PuckScope may use third-party services such as Supabase, hosting providers, analytics tools, and email providers to operate the platform.</p>
          <p>To request updates or removal of information, contact PuckScope through the contact page.</p>
          <p className="text-zinc-500">This is a launch placeholder and should be reviewed by a qualified professional before heavy public traffic or paid memberships.</p>
        </div>
      </div>
    </main>
  );
}
