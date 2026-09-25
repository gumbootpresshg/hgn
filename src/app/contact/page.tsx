import ContactForm from "@/components/ContactForm"
import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"
import { getContactSettings } from "@/lib/contact-settings"

export const dynamic = "force-dynamic"

const fallback = { title: "Contact Haida Gwaii News", eyebrow: "Contact", description: "Send news tips, advertising inquiries, letters, notices, obituaries, corrections and community information to the paper.", blocks: [
  { id: "contact-details", type: "callout" as const, content: "Haida Gwaii News\nPublisher / Editor: Stacey Brzostowski\nPhone: 250-557-0069\nMailing address: PO Box 22, Tlell, BC, V0T 1Y0" },
  { id: "contact-tip", type: "button" as const, label: "Submit a tip", url: "/submit-tip" },
  { id: "contact-advertise", type: "button" as const, label: "Advertise with HGN", url: "/advertise" },
  { id: "contact-letters", type: "button" as const, label: "Letters to the editor", url: "/letters" },
  { id: "contact-notices", type: "button" as const, label: "Public notices", url: "/notices/submit" },
] }

export default async function ContactPage() {
  const settings = await getContactSettings()
  const contactEmail = settings.contact_email || "sales@haidagwaiinews.com"
  return <ManagedInfoPage systemKey="contact" fallback={fallback}>
    <section className="mt-8 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-serif text-3xl font-bold text-hgnNavy">Send us a message</h2>
      <p className="mt-2 text-slate-600">Use this form for general questions and inquiries. Your message is saved securely for HGN staff and routed according to the topic you choose.</p>
      {settings.contact_form_enabled ? <ContactForm /> : <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">The web contact form is temporarily unavailable. Please email <a className="font-bold underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> or call 250-557-0069.</div>}
    </section>
  </ManagedInfoPage>
}
