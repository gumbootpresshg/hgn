import CorrectionsForm from "@/components/CorrectionsForm"
import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"

const fallback = { title: "Corrections & clarifications", eyebrow: "Accuracy", description: "See something that needs correcting? Send the newsroom a clear note and a link to the story.", blocks: [
  { id: "corrections-note", type: "callout" as const, content: "Please include the story URL or headline, the information you believe needs review, and any reliable source that helps us check it." },
] }

export default function CorrectionsPage() { return <ManagedInfoPage systemKey="corrections" fallback={fallback}><CorrectionsForm /></ManagedInfoPage> }
