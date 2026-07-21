import Link from "next/link";

export default function Page(){
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Community</div>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Community Submissions</h1>
        <p className="mt-4 text-lg text-slate-700">Everything a reader or community member needs: letters, tips, photos, marketplace, lost & found, polls, events and local alerts.</p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Link href="/submit-letter" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Opinion</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Send a Letter to the Editor</h2><p className="mt-2 text-sm text-slate-600">Submit a formal letter for editor review.</p></Link>
<Link href="/reader-reporter" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Reader Reporter</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Send News Tip / Photos / Video</h2><p className="mt-2 text-sm text-slate-600">Upload community news, road updates, ferry notes, sports scores or breaking photos.</p></Link>
<Link href="/marketplace/new" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Marketplace</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Post Marketplace Listing</h2><p className="mt-2 text-sm text-slate-600">Sell, rent, hire or share a service from your phone with photo upload.</p></Link>
<Link href="/lost-found" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Community</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Lost & Found / Missing Pets</h2><p className="mt-2 text-sm text-slate-600">Post missing pets, found items, stolen tools, bikes, boats and more.</p></Link>
<Link href="/community-pulse" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Polls</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Vote in Community Pulse</h2><p className="mt-2 text-sm text-slate-600">Daily polls with results and future comment support.</p></Link>
<Link href="/newsletter" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Email</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Join Newsletter</h2><p className="mt-2 text-sm text-slate-600">Get the HGN local update by email.</p></Link>
      </div>
    </main>
  );
}
