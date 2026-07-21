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
  if (["marketplace", "for-sale", "for sale", "buy-sell"].includes(raw)) return "home"
  if (["vehicle", "vehicles", "boat", "boats", "vehicles-boats"].includes(raw)) return "vehicles-boats"
  if (["home-sale", "home sale", "real estate", "real-estate", "realty"].includes(raw)) return "real-estate"
  if (["rental", "rentals"].includes(raw)) return "rentals"
  if (["free", "free stuff", "free-stuff"].includes(raw)) return "free-stuff"
  if (["notice", "notices", "community", "notices"].includes(raw)) return "notices"
  return raw || "home"
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
