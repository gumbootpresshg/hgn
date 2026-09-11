import Link from "next/link";

export default function Page(){
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Portal</div>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Advertiser Portal</h1>
        <p className="mt-4 text-lg text-slate-700">One simple place for local businesses to buy print ads, online placements, directory listings, deals, coupons and sponsored content.</p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Link href="/advertise" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Book Ads</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Request Ad Placement</h2><p className="mt-2 text-sm text-slate-600">Print, online, sponsored story, classified feature or package request.</p></Link>
<Link href="/deals" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Coupons</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Local Deals / Coupons</h2><p className="mt-2 text-sm text-slate-600">Business deals can become recurring monthly revenue.</p></Link>
<Link href="/marketplace/new" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Marketplace</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Post Paid Featured Listing</h2><p className="mt-2 text-sm text-slate-600">Listings can be upgraded later for featured placement.</p></Link>
<Link href="/ad-ops" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">HGN Sales</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Ad Product Ideas</h2><p className="mt-2 text-sm text-slate-600">Internal ad operations board and packages.</p></Link>
      </div>
    </main>
  );
}
