import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 bg-hgnNavy text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <b className="text-lg">Haida Gwaii News</b>
          <p className="mt-2 text-sm leading-6 text-slate-200">Community news, print paper, digital stories and island information.</p>
        </div>
        <div>
          <b>Reader links</b>
          <div className="mt-3 grid gap-2 text-sm text-slate-200">
            <Link href="/articles">News</Link>
            <Link href="/events">Events calendar</Link>
            <Link href="/letters">Letters to the Editor</Link>
            <Link href="/obituaries">Obituaries</Link>
          </div>
        </div>
        <div>
          <b>Community</b>
          <div className="mt-3 grid gap-2 text-sm text-slate-200">
            <Link href="/marketplace">Classifieds</Link>
            <Link href="/notices">Notices</Link>
            <Link href="/live-map">Live Map</Link>
            <Link href="/weather">Weather</Link>
          </div>
        </div>
        <div>
          <b>Support HGN</b>
          <p className="mt-3 text-sm leading-6 text-slate-200">Help keep local journalism and the website free for everyone.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/support-us" className="rounded-full bg-white px-4 py-2 text-sm font-black text-hgnNavy">Support Us</Link>
            <Link href="/advertise" className="rounded-full border border-white px-4 py-2 text-sm font-black text-white">Advertise</Link>
          </div>
        </div>
      </div>
    
        <div className="mt-6 flex justify-center gap-3 text-sm">
          <a href="https://www.facebook.com/haidagwaiinews" target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border px-3 py-2 font-bold">f</a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border px-3 py-2 font-bold">◎</a>
          <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X" className="rounded-full border px-3 py-2 font-bold">X</a>
        </div>
      
        <div className="mt-6 flex justify-center gap-4 text-sm font-bold">
          <a href="/about" className="hover:text-hgnBlue">About Us</a>
          <a href="/contact" className="hover:text-hgnBlue">Contact Us</a>
        </div>
      </footer>
  );
}
