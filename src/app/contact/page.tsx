import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { getContactSettings } from "@/lib/contact-settings";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getContactSettings();
  const contactEmail = settings.contact_email || "sales@haidagwaiinews.com";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Contact</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Contact Haida Gwaii News</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">Send news tips, advertising inquiries, letters, notices, obituaries, corrections and community information to the paper.</p>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Haida Gwaii News</h2>
            <div className="mt-4 space-y-3 text-slate-700">
              <p><span className="font-black text-hgnNavy">Publisher / Editor:</span><br />Stacey Brzostowski</p>
              <p><span className="font-black text-hgnNavy">Phone:</span><br /><a href="tel:2505570069" className="font-bold text-hgnBlue">250-557-0069</a></p>
              <p><span className="font-black text-hgnNavy">Email:</span><br /><a href={`mailto:${contactEmail}`} className="font-bold text-hgnBlue">{contactEmail}</a></p>
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
          <p className="mt-2 text-slate-600">Use this form for general questions and inquiries. Your message is saved securely for HGN staff and routed according to the topic you choose.</p>
          {settings.contact_form_enabled ? <ContactForm /> : <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">The web contact form is temporarily unavailable. Please email <a className="font-bold underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> or call 250-557-0069.</div>}
        </section>
      </section>
    </main>
  );
}
