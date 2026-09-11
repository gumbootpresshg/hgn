import Link from "next/link";

const sections = [
  ["Marketplace", "/marketplace", "Buy, sell and trade locally."],
  ["Vehicles & Boats", "/marketplace?category=Vehicles", "Cars, trucks, boats, trailers and equipment."],
  ["Realty", "/marketplace?category=Realty", "Rentals, real estate and housing notices."],
  ["Jobs", "/jobs", "Local job postings and hiring notices."],
  ["Notices", "/notices", "Public notices, community notices and announcements."],
];

export default function ClassifiedsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black text-hgnNavy">Classifieds</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Marketplace listings, jobs, realty, vehicles and boats for Haida Gwaii.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(([title, href, desc]) => (
          <Link key={href} href={href} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
            <h2 className="text-2xl font-black text-hgnNavy">{title}</h2>
            <p className="mt-3 text-slate-600">{desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
