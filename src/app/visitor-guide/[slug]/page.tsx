import { redirect } from "next/navigation"

// Keep old shared listing URLs safe while retiring the duplicate Guide surface.
export default async function VisitorListingRedirect() { redirect("/explore/directory") }
