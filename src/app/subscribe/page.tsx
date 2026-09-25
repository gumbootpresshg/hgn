import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"

const fallback = { title: "Subscribe to Haida Gwaii News", eyebrow: "Print subscriptions", description: "Subscribe to the print edition by eTransfer or cheque. For help, contact sales@haidagwaiinews.com.", blocks: [
  { id: "subscribe-rates", type: "table" as const, tableHeaders: ["Subscription", "Price", "Details"], tableRows: [["Haida Gwaii Residents", "$130", "Annual print subscription for readers on Haida Gwaii."], ["Off-Island Residents", "$150", "Annual print subscription for readers outside Haida Gwaii."]] },
  { id: "subscribe-pay", type: "heading" as const, content: "How to pay", level: 2 },
  { id: "subscribe-pay-copy", type: "callout" as const, content: "eTransfer: sales@haidagwaiinews.com\nCheque: Haida Gwaii News, PO Box 22, Tlell, BC, V0T 1Y0\nQuestions: sales@haidagwaiinews.com" },
] }

export default function SubscribePage() { return <ManagedInfoPage systemKey="subscribe" fallback={fallback} /> }
