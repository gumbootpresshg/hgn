import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Contact</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Contact Haida Gwaii News</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
        Send news tips, advertising inquiries, letters, notices, obituaries, corrections and community information to the paper.
      </p>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Haida Gwaii News</h2>
            <div className="mt-4 space-y-3 text-slate-700">
              <p><span className="font-black text-hgnNavy">Publisher / Editor:</span><br />Stacey Brzostowski</p>
              <p><span className="font-black text-hgnNavy">Phone:</span><br /><a href="tel:2505570069" className="font-bold text-hgnBlue">250-557-0069</a></p>
              <p><span className="font-black text-hgnNavy">Email:</span><br /><a href="mailto:sales@haidagwaiinews.com" className="font-bold text-hgnBlue">sales@haidagwaiinews.com</a></p>
              <p><span className="font-black text-hgnNavy">Mailing address:</span><br />PO Box 22<br />Tlell, BC<br />V0T 1Y0</p>
            </div>
          </div>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Helpful links</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/submit-tip" className="hgn-btn-primary">Submit a Tip</Link>
              <Link href="/advertise" className="hgn-btn-dark">Advertise</Link>
              <Link href="/letters" className="hgn-btn-primary">Letters</Link>
              <Link href="/notices/submit" className="hgn-btn-dark">Public Notices</Link>
            </div>
          </div>
        </div>

        <section className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Send us a message</h2>
          <p className="mt-2 text-slate-600">Use this simple form for general questions. For urgent ad bookings or public notices, call or email directly.</p>

          <form action="mailto:sales@haidagwaiinews.com" method="post" encType="text/plain" className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-hgnNavy">
                Name
                <input name="name" required className="rounded-2xl border px-4 py-3 font-normal text-slate-900" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-hgnNavy">
                Email
                <input name="email" type="email" required className="rounded-2xl border px-4 py-3 font-normal text-slate-900" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-bold text-hgnNavy">
              What is this about?
              <select name="topic" className="rounded-2xl border px-4 py-3 font-normal text-slate-900" defaultValue="General question">
                <option>General question</option>
                <option>News tip</option>
                <option>Advertising</option>
                <option>Subscription</option>
                <option>Public notice</option>
                <option>Obituary</option>
                <option>Correction</option>
                <option>Letter to the editor</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-hgnNavy">
              Message
              <textarea name="message" required rows={7} className="rounded-2xl border px-4 py-3 font-normal text-slate-900" />
            </label>

            <button className="hgn-btn-primary justify-center" type="submit">Send Message</button>
          </form>
        </section>
      </section>
    </main>
  );
}
