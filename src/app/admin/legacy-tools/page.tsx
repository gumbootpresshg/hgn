import Link from "next/link"

const groups = [
  {
    label: "Older newsroom dashboards",
    tools: [
      ["/admin/daily", "Daily"], ["/admin/daily-command", "Daily Command"], ["/admin/daily-desk", "Daily Desk"], ["/admin/daily-route", "Daily Route"],
      ["/admin/morning-desk", "Morning Desk"], ["/admin/today-board", "Today Board"], ["/admin/shift-center", "Shift Center"], ["/admin/next-up", "Next Up"],
      ["/admin/wrap-desk", "Wrap Desk"], ["/admin/focus-board", "Focus Board"], ["/admin/newsflow-board", "Newsflow Board"], ["/admin/newsroom", "Newsroom"],
      ["/admin/newsroom-hub", "Newsroom Hub"], ["/admin/editor-workbench", "Editor Workbench"], ["/admin/core-workflow", "Core Workflow"], ["/admin/publishing-compass", "Publishing Compass"],
    ]
  },
  {
    label: "Older publishing helpers",
    tools: [
      ["/admin/publish", "Publish"], ["/admin/fast-publish", "Fast Publish"], ["/admin/quickshot", "Quickshot"], ["/admin/publish-brief", "Publish Brief"],
      ["/admin/publish-sweep", "Publish Sweep"], ["/admin/preflight", "Preflight"], ["/admin/edit-queue", "Edit Queue"], ["/admin/copy-desk", "Copy Desk"], ["/admin/story-polish", "Story Polish"],
    ]
  },
  {
    label: "Beta, launch and release history",
    tools: [
      ["/admin/beta", "Beta"], ["/admin/beta-command", "Beta Command"], ["/admin/beta-feedback-loop", "Beta Feedback Loop"], ["/admin/beta-freeze", "Beta Freeze"],
      ["/admin/beta-launch-gate", "Beta Launch Gate"], ["/admin/beta-operations", "Beta Operations"], ["/admin/beta-ops", "Beta Ops"], ["/admin/beta-testers", "Beta Testers"],
      ["/admin/launch", "Launch"], ["/admin/launch-checklist", "Launch Checklist"], ["/admin/launch-cleanup", "Launch Cleanup"], ["/admin/launch-fix-pack", "Launch Fix Pack"],
      ["/admin/launch-ops", "Launch Ops"], ["/admin/launch-rehearsal", "Launch Rehearsal"], ["/admin/launch-room", "Launch Room"], ["/admin/go-live-command", "Go Live Command"],
      ["/admin/deployment-runway", "Deployment Runway"], ["/admin/release-candidate", "Release Candidate"], ["/admin/ship-check", "Ship Check"], ["/admin/production-lock", "Production Lock"],
      ["/admin/production-hardening", "Production Hardening"], ["/admin/online-beta-final-sweep", "Online Beta Final Sweep"], ["/admin/online-beta-hardening", "Online Beta Hardening"],
      ["/admin/online-beta-share-gate", "Online Beta Share Gate"], ["/admin/online-soft-beta", "Online Soft Beta"], ["/admin/soft-beta-command-center", "Soft Beta Command Center"],
      ["/admin/soft-beta-deployment", "Soft Beta Deployment"], ["/admin/soft-beta-launch", "Soft Beta Launch"], ["/admin/soft-launch", "Soft Launch"],
    ]
  },
  {
    label: "Deprecated / foreign-project candidates",
    tools: [
      ["/admin/draft-archive", "Draft Archive (PuckScope candidate)"], ["/admin/draft-order", "Draft Order (PuckScope candidate)"], ["/admin/players", "Players (PuckScope candidate)"],
      ["/admin/live-stats", "Live Stats (PuckScope candidate)"], ["/admin/bots", "Bots (PuckScope candidate)"], ["/admin/content", "Old Content Hub"],
      ["/admin/submission-desk", "Old Submission Desk"], ["/admin/homepage-control", "Old Homepage Control"], ["/admin/frontpage-radar", "Frontpage Radar"], ["/admin/simple-home", "Simple Home"],
      ["/admin/newsletter-desk", "Old Newsletter Desk"],
    ]
  }
]

export default function LegacyToolsPage() {
  return <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-7">
      <p className="text-xs font-black uppercase tracking-[.18em] text-amber-800">Publisher only</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">Legacy Tools</h1>
      <p className="mt-3 max-w-3xl text-amber-950">These older utilities are intentionally removed from the normal newsroom navigation. They remain reachable temporarily so useful functionality can be identified before code is retired.</p>
    </section>

    {groups.map(group => <section key={group.label} className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="font-serif text-2xl font-bold">{group.label}</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {group.tools.map(([href,label]) => <Link key={href} href={href} className="rounded-xl border p-3 text-sm font-semibold transition hover:border-hgnBlue hover:bg-blue-50">{label}</Link>)}
      </div>
    </section>)}
  </main>
}
