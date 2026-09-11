import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold text-blue-300">← PuckScope</Link>
        <p className="mt-10 text-sm uppercase tracking-[0.3em] text-blue-300">Terms</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight">Terms of Service</h1>
        <p className="mt-6 text-zinc-400">Last updated: April 27, 2026</p>
        <div className="mt-10 space-y-6 text-sm leading-7 text-zinc-300">
          <p>PuckScope provides hockey prospect rankings, scouting tools, draft simulations, articles, data views, and user-submitted profile workflows for informational and entertainment purposes.</p>
          <p>Rankings, projections, scouting notes, fantasy reads, draft fits, and pipeline scores are opinions or estimates and should not be treated as official NHL, league, team, player, or scouting-service records.</p>
          <p>Users submitting content confirm they have the right to submit it and that it may be reviewed, edited, approved, rejected, or removed by PuckScope.</p>
          <p>Users may not submit unlawful, misleading, defamatory, abusive, infringing, or private personal information about another person.</p>
          <p>PuckScope may change, remove, or restrict features at any time as the platform develops.</p>
          <p className="text-zinc-500">This is a launch placeholder and should be reviewed by a qualified professional before heavy public traffic or paid memberships.</p>
        </div>
      </div>
    </main>
  );
}
