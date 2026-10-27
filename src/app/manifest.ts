import type { MetadataRoute } from "next"
export default function manifest(): MetadataRoute.Manifest { return { name: "Haida Gwaii News", short_name: "HGN", description: "Local news and community information from Haida Gwaii.", start_url: "/", display: "standalone", background_color: "#fffefa", theme_color: "#ffffff", icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }] } }
