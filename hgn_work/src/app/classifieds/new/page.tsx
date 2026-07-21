import Link from "next/link";

export default function NewClassifiedRedirect(){
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="hgn-card p-6">
        <h1 className="text-4xl font-black text-hgnNavy">Classifieds are now Marketplace</h1>
        <p className="mt-3 text-slate-700">Use the new phone-friendly marketplace form with photo upload and phone contact support.</p>
        <Link href="/marketplace/new" className="hgn-btn-primary mt-5">Post Marketplace Listing</Link>
      </div>
    </main>
  );
}
