export type GuidePlace = {
  id: string
  name: string
  category: "Beach" | "Rest Stop" | "Fuel" | "Food" | "Essential Service" | "Transportation" | "Culture" | "Campground" | "Viewpoint" | "Camera"
  community: string
  latitude: number
  longitude: number
  description: string
  address?: string
  phone?: string
  website?: string
  hours?: string
  amenities?: string[]
  caution?: string
  featured?: boolean
}

export const guideCategories = [
  "All",
  "Beach",
  "Rest Stop",
  "Fuel",
  "Food",
  "Essential Service",
  "Transportation",
  "Culture",
  "Campground",
  "Viewpoint",
  "Camera",
] as const

export const guidePlaces: GuidePlace[] = [
  { id: "north-beach", name: "North Beach", category: "Beach", community: "North Graham Island", latitude: 54.072, longitude: -131.915, description: "Long ocean beach north of Masset with broad views and vehicle access in suitable conditions.", amenities: ["Beach access", "Scenic views"], caution: "Check tides, weather and beach-driving conditions before entering.", featured: true },
  { id: "agathe-beach", name: "Agate Beach", category: "Beach", community: "North Graham Island", latitude: 54.045, longitude: -131.93, description: "Popular north-end beach near Tow Hill and Naikoon Provincial Park.", amenities: ["Parking", "Beach access", "Nearby campground"], caution: "Ocean conditions can change quickly.", featured: true },
  { id: "east-beach-tlell", name: "East Beach at Tlell", category: "Beach", community: "Tlell", latitude: 53.557, longitude: -131.93, description: "Wide east-coast beach with long walks, driftwood and views across Hecate Strait.", amenities: ["Beach access", "Walking"], caution: "Watch tides, surf and changing weather." },
  { id: "balance-rock", name: "Balance Rock", category: "Viewpoint", community: "Skidegate", latitude: 53.269, longitude: -131.997, description: "A well-known roadside viewpoint and short stop between Skidegate and Daajing Giids.", amenities: ["Roadside stop", "Photo opportunity"], featured: true },
  { id: "tow-hill", name: "Tow Hill Trail", category: "Viewpoint", community: "North Graham Island", latitude: 54.073, longitude: -131.82, description: "Boardwalk and trail access to forest, river and elevated coastal viewpoints.", amenities: ["Trail", "Boardwalk", "Scenic views"], caution: "Use official park information and respect posted closures.", featured: true },
  { id: "haida-heritage-centre", name: "Haida Heritage Centre at Kay Llnagaay", category: "Culture", community: "Skidegate", latitude: 53.244, longitude: -131.993, description: "Major cultural centre sharing Haida history, art, knowledge and living culture.", website: "https://www.haidaheritagecentre.com/visit/", amenities: ["Museum", "Cultural centre", "Gift shop"], featured: true },
  { id: "skidegate-terminal", name: "Skidegate Ferry Terminal", category: "Transportation", community: "Skidegate", latitude: 53.266, longitude: -132.008, description: "Terminal for Prince Rupert and Alliford Bay ferry services.", website: "https://www.bcferries.com/current-conditions", phone: "1-888-223-3779", amenities: ["Ferry terminal", "Vehicle check-in"] },
  { id: "alliford-terminal", name: "Alliford Bay Ferry Terminal", category: "Transportation", community: "Moresby Island", latitude: 53.188, longitude: -131.989, description: "Moresby Island terminal for the inter-island ferry to Skidegate.", website: "https://www.bcferries.com/current-conditions", phone: "1-888-223-3779", amenities: ["Ferry terminal"] },
  { id: "masset-airport", name: "Masset Municipal Airport", category: "Transportation", community: "Masset", latitude: 54.027, longitude: -132.125, description: "Airport serving Masset and northern Haida Gwaii.", website: "https://massetbc.com/visitors/airport/", amenities: ["Airport", "Parking"] },
  { id: "sandspit-airport", name: "K’il Kun Xidgwangs Daanaay Airport", category: "Transportation", community: "Sandspit", latitude: 53.254, longitude: -131.814, description: "Airport serving Sandspit and Moresby Island.", amenities: ["Airport", "Parking"] },
  { id: "daajing-hospital", name: "Haida Gwaii Hospital and Health Centre", category: "Essential Service", community: "Daajing Giids", latitude: 53.253, longitude: -132.071, description: "Hospital and emergency health services for southern Haida Gwaii.", phone: "250-559-4900", amenities: ["Hospital", "Emergency department"] },
  { id: "masset-hospital", name: "Northern Haida Gwaii Hospital and Health Centre", category: "Essential Service", community: "Masset", latitude: 54.012, longitude: -132.149, description: "Hospital and health services for northern Haida Gwaii.", amenities: ["Hospital", "Emergency department"] },
  { id: "masset-fuel", name: "Masset Fuel", category: "Fuel", community: "Masset", latitude: 54.01, longitude: -132.15, description: "Fuel services in the Masset area. Confirm current hours before travelling long distances.", amenities: ["Gasoline", "Diesel"] },
  { id: "daajing-fuel", name: "Daajing Giids Fuel", category: "Fuel", community: "Daajing Giids", latitude: 53.255, longitude: -132.075, description: "Fuel services in Daajing Giids. Confirm current hours and product availability.", amenities: ["Gasoline", "Diesel"] },
  { id: "sandspit-fuel", name: "Sandspit Fuel", category: "Fuel", community: "Sandspit", latitude: 53.245, longitude: -131.82, description: "Fuel access for Sandspit and Moresby Island travellers.", amenities: ["Gasoline", "Diesel"] },
  { id: "naikoon-campground", name: "Agate Beach Campground", category: "Campground", community: "North Graham Island", latitude: 54.045, longitude: -131.925, description: "Provincial campground near Agate Beach and Tow Hill.", amenities: ["Camping", "Beach access"], caution: "Seasonal availability and reservation rules may apply." },
  { id: "mayer-lake", name: "Mayer Lake Rest Area", category: "Rest Stop", community: "Central Graham Island", latitude: 53.61, longitude: -132.05, description: "A practical roadside stopping area near Mayer Lake.", amenities: ["Roadside stop", "Scenic area"] },
  { id: "drivebc-tlell", name: "DriveBC Tlell Camera", category: "Camera", community: "Tlell", latitude: 53.565, longitude: -131.93, description: "Road-condition camera source for the Tlell area.", website: "https://images.drivebc.ca/bchighwaycam/pub/html/www/index-Northern.html", amenities: ["Road camera", "Live source"] },
  { id: "drivebc-masset", name: "DriveBC Masset Camera", category: "Camera", community: "Masset", latitude: 54.01, longitude: -132.15, description: "Road-condition camera source for northern Haida Gwaii.", website: "https://images.drivebc.ca/bchighwaycam/pub/html/www/index-Northern.html", amenities: ["Road camera", "Live source"] },
]

export const guideQuickLinks = [
  { title: "Island Map", href: "/explore/map", description: "Find beaches, fuel, rest stops, services and transportation." },
  { title: "Ferries & Travel", href: "/explore/travel", description: "Ferry routes, airports, road information and travel links." },
  { title: "Island Cams", href: "/explore/cams", description: "Quick access to road and ferry camera sources." },
  { title: "Food & Fuel", href: "/explore/directory?category=Food%20%26%20Drink", description: "Practical stops across the islands." },
  { title: "Beaches & Outdoors", href: "/explore/map?category=Beach", description: "Beaches, viewpoints, trails and campgrounds." },
  { title: "Essential Services", href: "/explore/map?category=Essential%20Service", description: "Hospitals, emergency resources and everyday services." },
]
