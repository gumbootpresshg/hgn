import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"

const fallback = { title: "Advertise With Haida Gwaii News", eyebrow: "2026 Rate Card", description: "Island-wide reach across Haida Gwaii, trusted independent local news, and ad dollars that stay local. Haida Gwaii News is distributed as a free print publication every other Thursday.", blocks: [
  { id: "advertise-email", type: "button" as const, label: "Email sales@haidagwaiinews.com", url: "mailto:sales@haidagwaiinews.com" },
  { id: "advertise-phone", type: "button" as const, label: "Call 250-557-0069", url: "tel:2505570069" },
  { id: "advertise-print", type: "heading" as const, content: "Print ads", level: 2 },
  { id: "advertise-print-rates", type: "table" as const, tableHeaders: ["Ad type", "Dimensions (W × H)", "Price"], tableRows: [["Business Card", "3.5\" × 2.0\"", "$55"], ["Quarter Page", "4.75\" × 6.0\"", "$225"], ["Banner", "9.5\" × 2.5\"", "$200"], ["Half Page", "9.5\" × 6.0\"", "$350"], ["Full Page", "9.5\" × 12.0\"", "$600"]] },
  { id: "advertise-website", type: "heading" as const, content: "Website ads", level: 2 },
  { id: "advertise-website-copy", type: "paragraph" as const, content: "Website ads start at $50 for random placement, with front page placement available for $200." },
  { id: "advertise-deadline", type: "heading" as const, content: "Booking deadline", level: 2 },
  { id: "advertise-deadline-copy", type: "paragraph" as const, content: "Booking deadlines are the Friday before publication. Contact sales to reserve space or ask about artwork requirements." },
  { id: "advertise-dates", type: "heading" as const, content: "2026 issue dates", level: 2 },
  { id: "advertise-issue-dates", type: "table" as const, tableHeaders: ["Month", "Publication dates"], tableRows: [["January", "1, 15, 29"], ["February", "12, 26"], ["March", "12, 26"], ["April", "9, 23"], ["May", "7, 21"], ["June", "4, 18"], ["July", "2, 16, 30"], ["August", "13, 27"], ["September", "10, 24"], ["October", "8, 22"], ["November", "5, 19"], ["December", "3, 17, 31"]] },
] }

export default function AdvertisePage() { return <ManagedInfoPage systemKey="advertise" fallback={fallback} /> }
