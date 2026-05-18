import Link from "next/link"

type LaunchCardProps = {
  title: string
  href: string
  children: React.ReactNode
}

export default function LaunchCard({ title, href, children }: LaunchCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </Link>
  )
}
