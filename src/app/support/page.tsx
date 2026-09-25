import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"

const fallback = { title: "Help keep Haida Gwaii News free for everyone.", eyebrow: "Support local journalism", description: "Reader support, Patreon supporters, donations, print subscribers and local advertisers help keep community news accessible across Haida Gwaii.", blocks: [
  { id: "support-patreon", type: "button" as const, label: "Support on Patreon", url: "https://www.patreon.com/HaidaGwaiiNews" },
  { id: "support-advertise", type: "button" as const, label: "Advertise with HGN", url: "/advertise" },
  { id: "support-reader", type: "heading" as const, content: "Reader supported", level: 3 },
  { id: "support-reader-copy", type: "paragraph" as const, content: "Small contributions help keep local reporting available without locking stories behind a paywall." },
  { id: "support-community", type: "heading" as const, content: "Community first", level: 3 },
  { id: "support-community-copy", type: "paragraph" as const, content: "Your support helps cover island news, events, notices, obituaries, sports and local voices." },
] }

export default function SupportPage() { return <ManagedInfoPage systemKey="support" fallback={fallback} /> }
