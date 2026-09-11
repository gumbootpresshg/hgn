"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const towns = ["Daajing Giids", "Skidegate", "Tlell", "Port Clements", "Masset", "Old Massett", "Sandspit", "Tow Hill", "All Islands"];
const types = ["Legal Notice", "Government Notice", "Legislative Notice", "Regulatory Notice", "Required Corporate Notice", "Public Notice"];

export default function SubmitNotice() {
  const [ok, setOk] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from("notices").insert({
      title: String(f.get("title") || ""),
      details: String(f.get("details") || ""),
      town: String(f.get("town") || ""),
      notice_type: String(f.get("notice_type") || ""),
      contact_name: String(f.get("contact_name") || ""),
      contact_email: String(f.get("contact_email") || ""),
      contact_phone: String(f.get("contact_phone") || ""),
      status: "pending",
      monthly_rate_cad: 100,
      payment_status: "unpaid",
      requires_approval: true,
    });
    if (error) alert(error.message); else setOk("Notice request submitted for approval. Public Notices are $100/month online; HGN will follow up about payment and placement details.");
  }
  return <main className="mx-auto max-w-3xl px-4 py-10"><Link href="/notices" className="text-sm font-bold text-hgnBlue">Back to Notices</Link><h1 className="mt-4 text-5xl font-black text-hgnNavy">Book a Public Notice</h1><div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><p className="font-black">Public Notices are $100 per month online and require approval before publishing.</p><p className="mt-2">This section is for government, legal, legislative, regulatory and required corporate/public notices. It is not for regular community posters, event flyers, or general announcements.</p><p className="mt-2 font-bold">Questions? Email <a className="underline" href="mailto:sales@haidagwaiinews.com">sales@haidagwaiinews.com</a> or call <a className="underline" href="tel:2505570069">250-557-0069</a>.</p></div><form onSubmit={submit} className="hgn-card mt-6 grid gap-4 p-6"><label>Notice title<input name="title" required /></label><label>Notice type<select name="notice_type">{types.map(t=><option key={t}>{t}</option>)}</select></label><label>Town / Area<select name="town">{towns.map(t=><option key={t}>{t}</option>)}</select></label><label>Notice details<textarea name="details" rows={8} required /></label><div className="grid gap-4 md:grid-cols-3"><label>Your name<input name="contact_name" required /></label><label>Email<input name="contact_email" type="email" required /></label><label>Phone<input name="contact_phone" /></label></div><button className="hgn-btn-primary">Submit Notice Request for Approval</button>{ok && <p className="font-bold text-hgnNavy">{ok}</p>}</form></main>;
}
