import { redirect } from "next/navigation"

export default function SubmitLetterRedirectPage() {
  redirect("/letters/submit")
}
