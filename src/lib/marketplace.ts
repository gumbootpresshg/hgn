export const marketplaceGroups = [
  {
    title: "Main Categories",
    items: [
      { label: "All Listings", slug: "all", icon: "◎" },
      { label: "Vehicles & Boats", slug: "vehicles-boats", icon: "🚗" },
      { label: "Real Estate", slug: "real-estate", icon: "🏠" },
      { label: "Rentals", slug: "rentals", icon: "🔑" },
      { label: "Jobs", slug: "jobs", icon: "💼" },
      { label: "Services", slug: "services", icon: "🛠" },
    ],
  },
  {
    title: "Buy & Sell",
    items: [
      { label: "Home", slug: "home", icon: "🛋" },
      { label: "Electronics", slug: "electronics", icon: "💻" },
      { label: "Clothing & Fashion", slug: "clothing-fashion", icon: "👕" },
      { label: "Kids & Baby", slug: "kids-baby", icon: "🧸" },
      { label: "Sports & Outdoors", slug: "sports-outdoors", icon: "🏕" },
      { label: "Health & Wellness", slug: "health-wellness", icon: "🌿" },
      { label: "Hobbies, Music & Collectibles", slug: "hobbies-music-collectibles", icon: "🎸" },
      { label: "Antiques & Vintage", slug: "antiques-vintage", icon: "🕰" },
      { label: "Pets", slug: "pets", icon: "🐾" },
      { label: "Free Stuff", slug: "free-stuff", icon: "🎁" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Tickets & Events", slug: "tickets-events", icon: "🎟" },
      { label: "Notices", slug: "notices", icon: "📌" },
      { label: "Farm & Industrial", slug: "farm-industrial", icon: "🚜" },
    ],
  },
]

export const marketplaceCategories = marketplaceGroups.flatMap((group) => group.items)

export function categoryLabel(slug?: string) {
  const value = String(slug || "home").toLowerCase()
  return marketplaceCategories.find((category) => category.slug === value)?.label || value.replaceAll("-", " ")
}

export function categoryIcon(slug?: string) {
  const value = String(slug || "home").toLowerCase()
  return marketplaceCategories.find((category) => category.slug === value)?.icon || "◎"
}

export function normalizedCategory(item: any) {
  const raw = String(item?.category || item?.listing_type || "home").toLowerCase()
  const slug = raw.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  if (["marketplace", "for-sale", "buy-sell"].includes(slug)) return "home"
  if (["vehicle", "vehicles", "boat", "boats", "vehicles-boats"].includes(slug)) return "vehicles-boats"
  if (["home-sale", "real-estate", "realty"].includes(slug)) return "real-estate"
  if (["rental", "rentals"].includes(slug)) return "rentals"
  if (["wanted-rental", "wanted-rentals"].includes(slug)) return "wanted-rentals"
  if (["free", "free-stuff"].includes(slug)) return "free-stuff"
  if (["notice", "notices", "community"].includes(slug)) return "notices"
  return slug || "home"
}

export function isPostedToday(value?: string) {
  if (!value) return false
  const date = new Date(value)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function primaryPhoto(item: any) {
  if (Array.isArray(item?.photos) && item.photos.length > 0) return item.photos[0]
  return item?.image_url || ""
}

export function allPhotos(item: any) {
  const photos = Array.isArray(item?.photos) ? item.photos.filter(Boolean) : []
  if (item?.image_url && !photos.includes(item.image_url)) photos.unshift(item.image_url)
  return photos
}
