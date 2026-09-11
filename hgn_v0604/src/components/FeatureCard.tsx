import Link from "next/link";

export function FeatureCard({ href, title, description, kicker }: { href: string; title: string; description: string; kicker?: string }) {
  return (
    <Link href={href} className="hgn-card group block p-5 transition hover:-translate-y-1 hover:shadow-md">
      {kicker && <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{kicker}</div>}
      <h3 className="mt-1 text-xl font-black text-hgnNavy group-hover:text-hgnBlue">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}
