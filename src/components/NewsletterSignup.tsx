"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const email = String(formData.get("email") || "").trim();
    const name = String(formData.get("name") || "").trim();
    if (!email) return setMessage("Please enter an email address.");

    const response = await fetch("/api/newsletters/subscribe", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,name,products:["hgn-news"]}) });
    const result = await response.json().catch(()=>({}));
    setMessage(response.ok ? (result.welcome?.sent ? "Thanks — check your inbox for a welcome email." : result.welcome?.reason || "Thanks — you're on the HGN newsletter list.") : result.error || "Could not save your signup.");
  }

  return (
    <form action={submit} className="rounded-2xl bg-hgnNavy p-5 text-white">
      <h3 className="text-xl font-black">Get HGN in your inbox</h3>
      <p className="mt-2 text-sm text-white/80">Local stories, events, notices and updates.</p>
      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <input name="name" placeholder="Name" className="rounded-lg border-0 px-3 py-2 text-slate-900" />
        <input name="email" type="email" placeholder="Email" className="rounded-lg border-0 px-3 py-2 text-slate-900" />
        <button className="rounded-lg bg-white px-4 py-2 font-black text-hgnNavy">Subscribe</button>
      </div>
      {message && <p className="mt-3 text-sm text-white/90">{message}</p>}
    </form>
  );
}
