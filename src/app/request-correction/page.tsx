import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { notifyHgnOperations } from "@/lib/hgn-operations-notify"

export const dynamic = "force-dynamic"

async function submitCorrection(formData: FormData) {
  "use server"
  const message = String(formData.get("message") || "").trim()
  if (!message) return
  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim()
  const relatedUrl = String(formData.get("related_url") || "").trim()
  const publicationScope = String(formData.get("publication_scope") || "online")
  const printEdition = String(formData.get("print_edition") || "").trim()
  const printPage = String(formData.get("print_page") || "").trim()
  const { data, error } = await supabase.from("correction_requests").insert({
    name: name || null,
    email: email || null,
    related_url: relatedUrl || null,
    publication_scope: publicationScope,
    print_edition: printEdition || null,
    print_page: printPage || null,
    issue_type: String(formData.get("issue_type") || "correction"),
    priority: "normal",
    message,
  }).select("id,created_at").single()
  if (error || !data?.id) {
    console.error("[correction] save failed", error?.message || "Missing record ID")
    return
  }
  try {
    await notifyHgnOperations({
      submissionType: "correction",
      sourceId: String(data.id),
      title: relatedUrl ? `Correction request: ${relatedUrl}` : `Correction request (${publicationScope})`,
      submitterName: name || null,
      submitterEmail: email || null,
      summary: message.slice(0, 240),
      publicAdminUrl: "/admin/corrections",
      receivedAt: data.created_at || null,
      metadata: { publication_scope: publicationScope, print_edition: printEdition || null, print_page: printPage || null },
    })
  } catch (notifyError) {
    console.error("[correction] Operations notification failed", notifyError instanceof Error ? notifyError.message : "Unknown error")
  }
}

export default function RequestCorrectionPage() {
  return <main className="mx-auto max-w-3xl px-4 py-10">
    <div className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm"><p className="text-sm font-black uppercase tracking-widest text-hgnGold">Accuracy matters</p><h1 className="mt-2 font-serif text-5xl font-bold">Request a correction</h1><p className="mt-3 text-white/80">Tell us what should be reviewed and whether it appeared online, in print, or both.</p></div>
    <form action={submitCorrection} className="mt-8 grid gap-5 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2"><label>Name<input name="name" placeholder="Optional"/></label><label>Email<input name="email" type="email" placeholder="Optional, for follow-up"/></label></div>
      <fieldset><legend className="font-bold">Where did the issue appear?</legend><div className="mt-2 flex flex-wrap gap-4"><label className="flex items-center gap-2"><input type="radio" name="publication_scope" value="online" defaultChecked/>Online</label><label className="flex items-center gap-2"><input type="radio" name="publication_scope" value="print"/>Print newspaper</label><label className="flex items-center gap-2"><input type="radio" name="publication_scope" value="both"/>Both</label></div></fieldset>
      <label>Online article or page URL<input name="related_url" placeholder="https://haidagwaiinews.com/articles/..."/></label>
      <div className="grid gap-4 md:grid-cols-2"><label>Print edition/date<input name="print_edition" placeholder="Example: September 12, 2026"/></label><label>Print page<input name="print_page" placeholder="Example: Page 3"/></label></div>
      <label>Issue type<select name="issue_type" defaultValue="correction"><option value="correction">Correction</option><option value="clarification">Clarification</option><option value="missing-context">Missing context</option><option value="privacy">Privacy concern</option><option value="other">Other</option></select></label>
      <label>What should we review?<textarea name="message" required rows={8} placeholder="Please explain what looks wrong and include any source or context that helps us verify it."/></label>
      <div className="flex flex-wrap gap-3"><button className="hgn-btn-primary">Submit request</button><Link href="/corrections" className="hgn-btn-dark">Corrections policy</Link></div>
    </form>
  </main>
}
