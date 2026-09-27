import { redirect } from "next/navigation"

// The former Visitor Guide is now a preserved public alias. Its legacy records
// remain in Supabase while all reader-facing Guide work lives under /explore.
export default function VisitorGuideRedirect() { redirect("/explore") }
