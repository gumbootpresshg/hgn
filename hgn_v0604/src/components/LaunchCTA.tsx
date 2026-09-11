import Link from "next/link";

export default function LaunchCTA() {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-hgnBlue">Community supported</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Keep local journalism free for everyone</h2>
          <p className="mt-2 text-slate-600">Support Haida Gwaii News through donations, Patreon support, advertising, and reader submissions.</p>
        </div>
        <Link href="/support" className="rounded-full bg-hgnNavy px-5 py-3 text-center text-sm font-black text-white">Support Us</Link>
        <Link href="/advertise" className="rounded-full bg-hgnBlue px-5 py-3 text-center text-sm font-black text-white">Advertise</Link>
      </div>
    </section>
  );
}
