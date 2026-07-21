"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const towns = ["Masset", "Old Massett", "Port Clements", "Tlell", "Skidegate", "Daajing Giids", "Sandspit", "Island-wide", "Other"];

export default function SubmitTipPage() {
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from("story_tips").insert({
      name: f.get("name"), email: f.get("email"), phone: f.get("phone"), town: f.get("town"), title: f.get("title"), details: f.get("details"), status: "new",
    });
    if (error) alert(error.message); else setDone(true);
  }
  return <main className="mx-auto max-w-3xl px-4 py-10"><div className="text-sm font-black uppercase tracking-widest text-hgnBlue">News tips</div><h1 className="mt-2 text-5xl font-black text-hgnNavy">Send a Story Tip</h1><p className="mt-3 text-slate-700">Have something HGN should look into? Send it to the editor for review.</p>{done ? <div className="hgn-card mt-6 p-6"><h2 className="text-2xl font-black text-hgnNavy">Tip submitted</h2><p className="mt-2 text-slate-700">Thanks. The newsroom will review it.</p></div> : <form onSubmit={submit} className="hgn-card mt-6 grid gap-4 p-6"><div className="grid gap-4 md:grid-cols-2"><label>Name<input name="name" /></label><label>Email<input name="email" type="email" /></label></div><div className="grid gap-4 md:grid-cols-2"><label>Phone<input name="phone" type="tel" /></label><label>Town<select name="town">{towns.map(t=><option key={t}>{t}</option>)}</select></label></div><label>Tip headline<input name="title" required /></label><label>Details<textarea name="details" rows={8} required /></label><button className="hgn-btn-primary">Submit tip</button></form>}</main>;
}
