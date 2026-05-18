import Link from "next/link";

export default function Page(){
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Workspace</div>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Columnist & Contributor Workspace</h1>
        <p className="mt-4 text-lg text-slate-700">For invited HGN writers, sports contributors, columnists and photographers. Public signup is closed; admins send invitations by email.</p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Link href="/login" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Account</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Contributor Login</h2><p className="mt-2 text-sm text-slate-600">Use the account created from your HGN invitation link.</p></Link>
        <Link href="/contribute" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">CMS</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Write or Submit Article</h2><p className="mt-2 text-sm text-slate-600">Draft stories, add category, excerpt and story body for editor review.</p></Link>
        <Link href="/reader-reporter" className="hgn-card block p-5 hover:shadow-md"><div className="text-xs font-black uppercase text-hgnBlue">Media</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">Upload Photos or Video</h2><p className="mt-2 text-sm text-slate-600">Send supporting media, captions and story leads to the newsroom.</p></Link>
      </div>
    </main>
  );
}
