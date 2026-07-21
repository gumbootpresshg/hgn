"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Data = { settings: any; editions: any[]; subscribers: number; test_sends: any[] };

async function token() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}

export default function NewsletterAutomationPage() {
  const [data, setData] = useState<Data | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [storyIds, setStoryIds] = useState<string[]>([]);

  async function call(path: string, body?: any, method = "POST") {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(path, {
        method,
        headers: { Authorization: `Bearer ${await token()}`, ...(body ? { "Content-Type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed");
      return result;
    } catch (error: any) {
      setMessage(error.message);
      throw error;
    } finally { setBusy(false); }
  }

  async function load() {
    try {
      const result = await call("/api/newsletters/settings", undefined, "GET");
      setData(result);
      setSelected((current) => current || result.editions?.[0]?.id || "");
      setTestEmail(result.settings?.test_email || "");
    } catch {}
  }

  useEffect(() => { load(); }, []);
  const preview = useMemo(() => data?.editions.find((edition) => edition.id === selected), [data, selected]);
  useEffect(() => { setStoryIds((preview?.content_json?.articles || []).map((article: any) => article.id)); }, [selected, preview?.id]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries()) as any;
    ["require_approval", "include_events", "include_weather", "include_ferry", "include_marketplace", "include_obituaries", "include_opinion", "include_guide"].forEach((key) => body[key] = form.get(key) === "on");
    await call("/api/newsletters/settings", body);
    setMessage("Newsletter settings saved.");
    await load();
  }

  async function build(articleIds?: string[]) {
    const result = await call("/api/newsletters/build", articleIds ? { article_ids: articleIds } : {});
    setMessage(`Newsletter built with ${result.diagnostics?.stories_included || 0} stories and ${result.diagnostics?.events_included || 0} events.`);
    await load();
    setSelected(result.edition.id);
  }

  async function test() {
    const result = await call("/api/newsletters/test", { edition_id: selected, email: testEmail });
    setMessage(result.message || `Test accepted for ${testEmail}.`);
    await load();
  }

  async function send() {
    if (!confirm("Send this newsletter to all active biweekly subscribers now?")) return;
    const result = await call("/api/newsletters/send", { edition_id: selected });
    setMessage(`Send complete: ${result.sent} accepted, ${result.failed} failed.`);
    await load();
  }

  function moveStory(index: number, direction: -1 | 1) {
    setStoryIds((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  if (!data) return <main className="mx-auto max-w-6xl px-4 py-10"><div className="hgn-card p-8">Loading Newsletter Desk… {message}</div></main>;
  const settings = data.settings;
  const articles = preview?.content_json?.articles || [];
  const diagnostics = preview?.build_diagnostics || {};

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <header className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Operations</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Newsletter Automation</h1><p className="mt-3 max-w-3xl text-slate-700">Build, inspect, test and send preference-aware newsletters without sending an empty envelope into the fog.</p></div><img src="/brand/hgn-news-seal.png" alt="Haida Gwaii News" className="h-32 w-32 object-contain" /></header>
    {message && <div className="mt-6 rounded-xl border bg-slate-50 p-4 font-bold">{message}</div>}
    <section className="mt-8 grid gap-4 md:grid-cols-3"><div className="hgn-card p-5"><div className="text-xs font-black uppercase text-slate-500">Active subscribers</div><div className="mt-2 text-4xl font-black">{data.subscribers}</div></div><div className="hgn-card p-5"><div className="text-xs font-black uppercase text-slate-500">Mode</div><div className="mt-2 text-3xl font-black capitalize">{settings.mode}</div></div><div className="hgn-card p-5"><div className="text-xs font-black uppercase text-slate-500">Last sent</div><div className="mt-2 text-xl font-black">{settings.last_sent_at ? new Date(settings.last_sent_at).toLocaleString() : "Never"}</div></div></section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <form onSubmit={save} className="hgn-card grid gap-4 p-6"><h2 className="text-2xl font-black text-hgnNavy">Settings</h2><label>Newsletter mode<select name="mode" defaultValue={settings.mode}><option value="manual">Manual send only</option><option value="automatic">Automatic schedule</option></select></label><label>Automatic action<select name="automatic_action" defaultValue={settings.automatic_action}><option value="build_for_approval">Build for approval</option><option value="build_and_send">Build and send</option></select></label><label className="flex items-center gap-2"><input className="w-auto" type="checkbox" name="require_approval" defaultChecked={settings.require_approval} />Require approval before sending</label><div className="grid gap-3 md:grid-cols-3"><label>Every days<input name="frequency_days" type="number" defaultValue={settings.frequency_days} /></label><label>Lookback days<input name="lookback_days" type="number" defaultValue={settings.lookback_days} /></label><label>Max stories<input name="max_stories" type="number" defaultValue={settings.max_stories} /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Send weekday<select name="send_weekday" defaultValue={settings.send_weekday}>{["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day,index)=><option value={index} key={day}>{day}</option>)}</select></label><label>Pacific hour<select name="send_hour" defaultValue={settings.send_hour}>{Array.from({length:24},(_,index)=><option value={index} key={index}>{String(index).padStart(2,"0")}:00</option>)}</select></label></div><fieldset className="grid gap-2 rounded-xl border p-4"><legend className="px-2 font-black">Default content</legend>{[["include_events","Events"],["include_weather","Weather"],["include_ferry","Ferry"],["include_marketplace","Marketplace"],["include_obituaries","Obituaries"],["include_opinion","Opinion"],["include_guide","Guide updates"]].map(([key,label])=><label className="flex items-center gap-2" key={key}><input className="w-auto" type="checkbox" name={key} defaultChecked={Boolean(settings[key])}/>{label}</label>)}</fieldset><label>From name<input name="from_name" defaultValue={settings.from_name}/></label><label>From email<input name="from_email" type="email" defaultValue={settings.from_email}/></label><label>Reply-to<input name="reply_to" type="email" defaultValue={settings.reply_to||""}/></label><label>Test email<input name="test_email" type="email" defaultValue={settings.test_email||""}/></label><button disabled={busy} className="hgn-btn-primary">Save settings</button></form>

      <div className="grid content-start gap-6">
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Build and send</h2><p className="mt-2 text-slate-600">The builder now falls back to the newest published stories when the date window finds nothing, and explains what it included.</p><div className="mt-5 flex flex-wrap gap-3"><button disabled={busy} onClick={() => build()} className="hgn-btn-primary">Build newsletter now</button><Link href="/newsletter" className="hgn-btn-dark">Signup page</Link><Link href="/newsletter-archive" className="hgn-btn-dark">Archive</Link></div><label className="mt-5 block">Edition<select value={selected} onChange={(event)=>setSelected(event.target.value)}>{data.editions.map((edition)=><option key={edition.id} value={edition.id}>{edition.title} · {edition.status}</option>)}</select></label><label className="mt-3 block">Test recipient<input type="email" value={testEmail} onChange={(event)=>setTestEmail(event.target.value)}/></label><div className="mt-4 flex flex-wrap gap-3"><button disabled={busy||!selected||!testEmail||(!articles.length && !(preview?.content_json?.events||[]).length)} onClick={test} className="hgn-btn-dark">Send test</button><button disabled={busy||!selected||(!articles.length && !(preview?.content_json?.events||[]).length)} onClick={send} className="rounded-xl bg-red-700 px-5 py-3 font-black text-white">Approve and send</button></div></div>

        {preview && <div className="hgn-card p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-black uppercase text-hgnBlue">Preview · {preview.status}</div><h2 className="mt-2 text-3xl font-black text-hgnNavy">{preview.title}</h2></div><div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-black">{articles.length} stories · {(preview.content_json?.events||[]).length} events</div></div><p className="mt-2 text-slate-700">{preview.intro}</p>{!articles.length && <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 font-bold text-amber-900">No stories are in this edition. Rebuild it before testing or sending.</div>}<div className="mt-5 divide-y">{storyIds.map((id,index)=>{const article=articles.find((item:any)=>item.id===id);if(!article)return null;return <article key={id} className="py-4"><div className="flex gap-3"><input className="mt-1 w-auto" type="checkbox" checked={storyIds.includes(id)} readOnly/><div className="min-w-0 flex-1"><div className="text-xs font-black uppercase text-hgnBlue">{article.category||"News"}</div><div className="text-xl font-black">{article.title}</div><p className="mt-1 text-sm text-slate-600">{article.excerpt}</p></div><div className="flex flex-col gap-1"><button type="button" className="rounded border px-2" onClick={()=>moveStory(index,-1)}>↑</button><button type="button" className="rounded border px-2" onClick={()=>moveStory(index,1)}>↓</button></div></div></article>})}</div>{storyIds.length>0&&<button disabled={busy} onClick={()=>build(storyIds)} className="mt-4 hgn-btn-dark">Rebuild with this order</button>}<p className="mt-4 text-sm font-bold">Planned recipients: {preview.recipient_count||0}</p></div>}

        {preview && <div className="hgn-card p-6"><h2 className="text-xl font-black text-hgnNavy">Build report</h2><div className="mt-3 grid gap-3 sm:grid-cols-3"><div><div className="text-xs font-black uppercase text-slate-500">Source</div><div className="font-bold">{diagnostics.source||"Older build"}</div></div><div><div className="text-xs font-black uppercase text-slate-500">Candidates found</div><div className="font-bold">{diagnostics.candidates_found??"—"}</div></div><div><div className="text-xs font-black uppercase text-slate-500">Stories included</div><div className="font-bold">{diagnostics.stories_included??articles.length}</div></div></div>{diagnostics.articles?.length>0&&<div className="mt-4 max-h-64 overflow-y-auto divide-y rounded-xl border">{diagnostics.articles.map((item:any)=><div key={item.id} className="p-3 text-sm"><strong>{item.included?"Included":"Excluded"}:</strong> {item.title} <span className="text-slate-500">({item.reason})</span></div>)}</div>}</div>}

        <div className="hgn-card p-6"><h2 className="text-xl font-black text-hgnNavy">Recent test sends</h2>{!data.test_sends?.length?<p className="mt-3 text-slate-600">No recorded tests yet.</p>:<div className="mt-3 divide-y">{data.test_sends.map((item)=><div key={item.id} className="py-3 text-sm"><div className="font-black">{item.email} · {item.status}</div><div className="text-slate-500">{new Date(item.created_at).toLocaleString()}{item.resend_email_id?` · Resend ID ${item.resend_email_id}`:""}</div>{item.error_message&&<div className="text-red-700">{item.error_message}</div>}</div>)}</div>}</div>
      </div>
    </section>
  </main>;
}
