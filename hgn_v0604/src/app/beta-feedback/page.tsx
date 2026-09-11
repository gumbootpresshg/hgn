"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BetaFeedbackPage() {
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      page_url: String(form.get("page_url") || ""),
      issue_type: String(form.get("issue_type") || "General feedback"),
      message: String(form.get("message") || ""),
      status: "new",
    };

    const { error } = await supabase.from("beta_feedback").insert(payload);
    if (error) {
      alert(error.message);
      return;
    }
    setDone(true);
    e.currentTarget.reset();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Beta testing</p>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy">Report site feedback</h1>
        <p className="mt-3 text-slate-700">
          Testing the new Haida Gwaii News site? Send broken links, mobile issues,
          missing information, or ideas directly to the newsroom team.
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <label>Name<input name="name" /></label>
          <label>Email<input name="email" type="email" /></label>
          <label>Page or link with issue<input name="page_url" placeholder="/letters, /marketplace, etc." /></label>
          <label>Type<select name="issue_type"><option>Broken page/link</option><option>Mobile display issue</option><option>Missing information</option><option>Editorial/content note</option><option>General feedback</option></select></label>
          <label>Feedback<textarea name="message" rows={7} required /></label>
          <button className="hgn-btn-primary">Send feedback</button>
          {done && <p className="font-bold text-green-700">Thanks — feedback submitted.</p>}
        </form>
      </div>
    </main>
  );
}
