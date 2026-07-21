"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/SectionHeader";

export default function LostFound() {
  const [items, setItems] = useState<any[]>([]);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    supabase.from("lost_found").select("*").eq("status", "approved").order("created_at", { ascending: false }).then(({ data }) => setItems(data || []));
  }, []);

  async function submit(e: any) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      type: f.get("type"), title: f.get("title"), description: f.get("description"), location: f.get("location"),
      contact_name: f.get("contact_name"), contact_email: f.get("contact_email"), phone: f.get("phone"),
    };
    const { error } = await supabase.from("lost_found").insert(payload);
    if (error) alert(error.message); else { setOk(true); e.currentTarget.reset(); }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeader eyebrow="Community Help" title="Lost & Found / Missing Pets" description="Missing dogs, found keys, stolen bikes, tools, boats, kayaks and community alerts." />
      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <form onSubmit={submit} className="hgn-card grid gap-4 p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Submit an item</h2>
          <label>Type<select name="type"><option>Missing Pet</option><option>Lost Item</option><option>Found Item</option><option>Stolen Item</option></select></label>
          <label>Title<input name="title" required /></label>
          <label>Location<input name="location" /></label>
          <label>Description<textarea name="description" rows={6} required /></label>
          <label>Your name<input name="contact_name" required /></label>
          <label>Email<input name="contact_email" type="email" required /></label>
          <label>Phone<input name="phone" /></label>
          <button className="hgn-btn-primary">Send for review</button>
          {ok && <p className="font-semibold text-green-700">Submitted for editor review.</p>}
        </form>
        <div className="grid gap-4">
          {items.length ? items.map((i) => <article key={i.id} className="hgn-card p-5"><div className="text-xs font-black uppercase text-hgnBlue">{i.type} · {i.location}</div><h3 className="text-xl font-black text-hgnNavy">{i.title}</h3><p className="mt-2 text-slate-700">{i.description}</p><p className="mt-3 text-sm text-slate-500">Contact: {i.contact_name} {i.phone ? `· ${i.phone}` : ""}</p></article>) : <div className="hgn-card p-6 text-slate-600">No approved listings yet.</div>}
        </div>
      </section>
    </main>
  );
}
