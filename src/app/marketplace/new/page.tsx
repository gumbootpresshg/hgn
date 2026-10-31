import { redirect } from "next/navigation"

// Keep old links working, but use the authenticated marketplace posting flow.
export default function NewMarketplaceListingRedirect() {
  redirect("/marketplace/post")
}
