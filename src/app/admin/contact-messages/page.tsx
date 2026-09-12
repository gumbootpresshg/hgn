import { redirect } from "next/navigation"

export default function ContactMessagesRedirectPage() {
  redirect("/admin/inbox")
}
