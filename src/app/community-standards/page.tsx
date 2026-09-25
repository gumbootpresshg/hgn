import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"

const fallback = { title: "Community standards", eyebrow: "Community", description: "How Haida Gwaii News reviews reader tips, listings, letters, photos and community submissions before publishing.", blocks: [
  { id: "standards-submit", type: "button" as const, label: "Send a submission", url: "/community-board" },
  { id: "standards-correction", type: "button" as const, label: "Request a correction", url: "/corrections" },
  { id: "standards-verify", type: "heading" as const, content: "We verify claims", level: 3 },
  { id: "standards-verify-copy", type: "paragraph" as const, content: "News tips and public claims may be held while an editor confirms sources, dates, names and context." },
  { id: "standards-protect", type: "heading" as const, content: "We protect people", level: 3 },
  { id: "standards-protect-copy", type: "paragraph" as const, content: "Submissions can be edited or rejected when they expose private information, target people unfairly or create avoidable harm." },
  { id: "standards-decisions", type: "heading" as const, content: "We explain decisions", level: 3 },
  { id: "standards-decisions-copy", type: "paragraph" as const, content: "When possible, HGN gives submitters a clear reason if something needs edits, extra verification or cannot be published." },
] }

export const dynamic = "force-dynamic"
export default function CommunityStandardsPage() { return <ManagedInfoPage systemKey="community_standards" fallback={fallback} /> }
