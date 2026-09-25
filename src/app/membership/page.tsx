import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"

const fallback = { title: "Create a Free HGN Account", eyebrow: "HGN Accounts", description: "A free HGN account lets readers post and manage classifieds, sign up for newsletters, submit events and save stories.", blocks: [
  { id: "membership-signup", type: "button" as const, label: "Sign up free", url: "/login" },
  { id: "membership-note", type: "callout" as const, content: "Paid memberships are not open yet. This page can be updated when supporter memberships are ready." },
] }

export default function MembershipPage() { return <ManagedInfoPage systemKey="membership" fallback={fallback} /> }
