import { redirect } from "next/navigation"

// New visitor-facing places are created by HGN editors in Guide Manager.
export default function VisitorGuideSubmitRedirect() { redirect("/explore") }
