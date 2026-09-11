import Link from "next/link";

export default function BetaLaunchCard() {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-hgnBlue">Beta launch readiness</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">Final demo checklist</h2>
      <p className="mt-2 text-slate-600">
        Test the public pages, mobile menu, article editor, submission flows, ads, weather, events, and marketplace before sending the beta link.
      </p>
      <Link href="/admin/launch-checklist" className="mt-4 inline-flex rounded-full bg-hgnNavy px-5 py-3 text-sm font-bold text-white">
        Open launch checklist
      </Link>
    </section>
  );
}
