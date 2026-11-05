import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"
import { nonNewsPageMetadata } from "@/lib/page-metadata"
import { absoluteUrl } from "@/lib/site"

export const metadata = nonNewsPageMetadata("Subscribe", "Subscribe to Haida Gwaii News and keep up with island reporting.", "/subscribe")

const fallback = { title: "Subscribe to Haida Gwaii News", eyebrow: "Print subscriptions", description: "Subscribe to the print edition by eTransfer or cheque. For help, contact sales@haidagwaiinews.com.", blocks: [
  { id: "subscribe-rates", type: "table" as const, tableHeaders: ["Subscription", "Price", "Details"], tableRows: [["Haida Gwaii Residents", "$130", "Annual print subscription for readers on Haida Gwaii."], ["Off-Island Residents", "$150", "Annual print subscription for readers outside Haida Gwaii."]] },
  { id: "subscribe-pay", type: "heading" as const, content: "How to pay", level: 2 },
  { id: "subscribe-pay-copy", type: "callout" as const, content: "eTransfer: sales@haidagwaiinews.com\nCheque: Haida Gwaii News, PO Box 22, Tlell, BC, V0T 1Y0\nQuestions: sales@haidagwaiinews.com" },
] }

const feeds = [
  ["Main RSS", "/rss.xml"],
  ["News RSS", "/feeds/news.xml"],
  ["Opinion RSS", "/feeds/opinion.xml"],
  ["Sports RSS", "/feeds/sports.xml"],
  ["Atom", "/atom.xml"],
]

export default function SubscribePage() {
  return <ManagedInfoPage systemKey="subscribe" fallback={fallback}>
    <section className="mt-8 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-black uppercase tracking-[.2em] text-hgnBlue">News readers</p>
      <h2 className="mt-2 font-serif text-3xl font-bold text-hgnNavy">RSS and Atom feeds</h2>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">Follow Haida Gwaii News in a news reader. Copy one of these addresses into Flipboard, Feedly, or another reader. The main feed is the one most people want.</p>
      <ul className="mt-6 space-y-4">
        {feeds.map(([label, path]) => {
          const url = absoluteUrl(path)
          return <li key={path} className="border-t border-stone-200 pt-4 first:border-t-0 first:pt-0">
            <a className="font-bold text-hgnNavy underline" href={url}>{label}</a>
            <p className="mt-1 break-all font-mono text-sm text-slate-700">{url}</p>
          </li>
        })}
      </ul>
    </section>
  </ManagedInfoPage>
}
