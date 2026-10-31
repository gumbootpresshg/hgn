import { permanentRedirect } from "next/navigation"

const haidaGwaiiOnlineUrl = "https://haidagwaiionline.com"

// Haida Gwaii Online is the public home for maps, places, businesses and travel planning.
export default function HaidaGwaiiOnlineRedirect() {
  permanentRedirect(haidaGwaiiOnlineUrl)
}
