export const marketplaceCategories = [
  { value: "vehicles-boats", label: "Vehicles & Boats" },
  { value: "real-estate", label: "Real Estate" },
  { value: "rentals", label: "Rentals" },
  { value: "jobs", label: "Jobs" },
  { value: "services", label: "Services" },
  { value: "home", label: "Home" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing-fashion", label: "Clothing & Fashion" },
  { value: "kids-baby", label: "Kids & Baby" },
  { value: "sports-outdoors", label: "Sports & Outdoors" },
  { value: "health-wellness", label: "Health & Wellness" },
  { value: "hobbies-music-collectibles", label: "Hobbies, Music & Collectibles" },
  { value: "antiques-vintage", label: "Antiques & Vintage" },
  { value: "pets", label: "Pets" },
  { value: "free-stuff", label: "Free Stuff" },
  { value: "tickets-events", label: "Tickets & Events" },
  { value: "notices", label: "Notices" },
  { value: "farm-industrial", label: "Farm & Industrial" },
]

export const haidaGwaiiCommunities = [
  "Masset",
  "Old Massett",
  "Port Clements",
  "Tlell",
  "Skidegate",
  "Daajing Giids",
  "Sandspit",
  "Queen Charlotte",
  "Tow Hill",
  "Other / Haida Gwaii",
]

export function formatPrice(value: unknown) {
  if (value === null || value === undefined || value === "") return "Contact for price"
  const number = Number(String(value).replace(/[^0-9.]/g, ""))
  if (!Number.isFinite(number) || number <= 0) return "Contact for price"
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: number % 1 === 0 ? 0 : 2,
  }).format(number)
}
