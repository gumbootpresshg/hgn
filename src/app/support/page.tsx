import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"

const fallback = { title: "Keep Haida Gwaii News free for everyone.", eyebrow: "Reader-supported local journalism", description: "Every print issue and every story online is free to read. Reader support helps keep it that way.", blocks: [
  { id: "support-patreon", type: "button" as const, label: "Support monthly on Patreon", url: "https://www.patreon.com/HaidaGwaiiNews" },
  { id: "support-advertise", type: "button" as const, label: "Advertise with HGN", url: "/advertise" },
  { id: "support-why", type: "heading" as const, content: "Free in print and online", level: 2 },
  { id: "support-why-copy", type: "paragraph" as const, content: "For Vince and Stacey, keeping independent local news free in print and online is a core value. We believe everyone should be able to read what is happening on the islands without a paywall." },
  { id: "support-writers", type: "heading" as const, content: "Where your support goes", level: 2 },
  { id: "support-writers-copy", type: "paragraph" as const, content: "Reader support first helps cover the real costs of producing the paper and website. After essential bills are paid, paying HGN writers is the first priority. Further support helps us provide stronger reporting, photography, island information and a better service for readers." },
  { id: "support-options", type: "heading" as const, content: "Support in the way that works for you", level: 2 },
  { id: "support-transfer", type: "callout" as const, content: "One-time e-Transfer\nSend to: support@haidagwaiinews.com\nMemo: HGN Support\n\nMail a cheque\nPayable to: Haida Gwaii News\nPO Box 22\nTlell, BC V0T 1Y0\nMemo: Reader support" },
  { id: "support-note", type: "paragraph" as const, content: "Reader support is voluntary and not tax-deductible. Patreon is HGN’s current monthly support option." },
] }

export default function SupportPage() { return <ManagedInfoPage systemKey="support" fallback={fallback} /> }
