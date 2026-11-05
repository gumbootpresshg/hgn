"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type InboxView = "new" | "open" | "replied" | "backlog" | "archive";
type ContactMessage = {
  id: string; title?: string | null; sender_name?: string | null; sender_email?: string | null;
  message?: string | null; payload?: Record<string, any> | null; status?: string | null;
  priority?: string | null; created_at?: string | null; updated_at?: string | null;
  read_at?: string | null; archived_at?: string | null; assigned_to?: string | null;
  replied_at?: string | null; reply_count?: number | null; last_reply_subject?: string | null;
};

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const viewNames: Record<InboxView, string> = { new: "New", open: "Open", replied: "Replied", backlog: "Older unread", archive: "Archive" };

export default function ContactMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState("");
  const [view, setView] = useState<InboxView>("new");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [replyingId, setReplyingId] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    const [{ data: auth }, { data, error }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("submission_inbox").select("*").eq("submission_type", "contact_message").order("created_at", { ascending: false }).limit(300),
    ]);
    setCurrentEmail(auth.user?.email || "");
    if (error) setMessage(error.message);
    setItems((data || []) as ContactMessage[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const groups = useMemo(() => {
    const now = Date.now();
    const grouped: Record<InboxView, ContactMessage[]> = { new: [], open: [], replied: [], backlog: [], archive: [] };
    for (const item of items) {
      if (item.archived_at) grouped.archive.push(item);
      else if (item.replied_at) grouped.replied.push(item);
      else if (item.read_at) grouped.open.push(item);
      else if (rowTime(item) >= now - NEW_WINDOW_MS) grouped.new.push(item);
      else grouped.backlog.push(item);
    }
    return grouped;
  }, [items]);

  const visible = groups[view];
  const selectedItems = visible.filter(item => selected.has(item.id));

  async function updateItems(targets: ContactMessage[], values: Record<string, unknown>, success?: string) {
    if (!targets.length) return;
    setWorking(targets[0].id);
    setMessage("");
    const ids = targets.map(item => item.id);
    const { error } = await supabase.from("submission_inbox").update({ ...values, updated_at: new Date().toISOString() }).in("id", ids);
    if (error) setMessage(error.message);
    else {
      if (success) setMessage(success);
      setSelected(new Set());
      await load();
    }
    setWorking("");
  }

  async function startReply(item: ContactMessage) {
    if (!item.read_at) await updateItems([item], { read_at: new Date().toISOString(), status: "read" });
    setReplyingId(item.id);
    setReplySubject(item.last_reply_subject || `Re: ${String(item.title || "Your message to Haida Gwaii News").replace(/^Contact:\s*/i, "")}`);
    setReplyBody(`Hi ${item.sender_name || "there"},\n\n\n\nThanks,\nHaida Gwaii News`);
  }

  async function sendReply(item: ContactMessage) {
    setWorking(item.id);
    setMessage("");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { setMessage("Your login session could not be verified. Please sign in again."); setWorking(""); return; }
    const response = await fetch(`/api/admin/contact/${encodeURIComponent(item.id)}/reply`, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ subject: replySubject, message: replyBody }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(result.error || "Reply could not be sent.");
    else { setMessage(`Reply sent to ${item.sender_email}.`); setReplyingId(""); setReplyBody(""); await load(); }
    setWorking("");
  }

  async function deleteMessage(item: ContactMessage) {
    if (!window.confirm(`Delete this message from ${item.sender_name || item.sender_email || "the sender"}? This cannot be undone.`)) return;
    setWorking(item.id);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { setMessage("Your login session could not be verified. Please sign in again."); setWorking(""); return; }
    const response = await fetch(`/api/admin/contact/${encodeURIComponent(item.id)}/delete`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(result.error || "Message could not be deleted.");
    else { setMessage("Message deleted."); await load(); }
    setWorking("");
  }

  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
    <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-hgnBlue">Incoming</p>
      <h1 className="mt-3 font-serif text-5xl font-bold text-hgnNavy">Inbox</h1>
      <p className="mt-3 max-w-3xl text-slate-600">New shows only unread messages received in the last 30 days. Older unread correspondence is kept safely in Older unread, so it does not make today’s inbox look busy.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {(Object.keys(viewNames) as InboxView[]).map(key => <Stat key={key} label={viewNames[key]} value={groups[key].length} emphasis={key === "new"} />)}
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-b pb-4">
        {(Object.keys(viewNames) as InboxView[]).map(key => <Tab key={key} active={view === key} onClick={() => { setView(key); setSelected(new Set()); }}>{viewNames[key]}{groups[key].length ? ` (${groups[key].length})` : ""}</Tab>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => void load()} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Refresh</button>
        {visible.length ? <><label className="ml-auto flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold"><input type="checkbox" checked={visible.every(item => selected.has(item.id))} onChange={event => setSelected(event.target.checked ? new Set(visible.map(item => item.id)) : new Set())} /> Select all</label>{selectedItems.length ? <><button onClick={() => void updateItems(selectedItems, { read_at: new Date().toISOString(), status: "read" }, "Marked read.")} className="rounded-full border px-4 py-2 text-sm font-semibold">Mark read</button><button onClick={() => void updateItems(selectedItems, { archived_at: new Date().toISOString(), status: "archived" }, "Archived.")} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold">Archive selected</button></> : null}</> : null}
      </div>
      {message ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
    </section>

    {loading ? <p className="rounded-2xl border bg-white p-6">Loading messages...</p> : null}
    {!loading && !visible.length ? <p className="rounded-2xl border bg-white p-6 text-slate-500">Nothing in {viewNames[view].toLowerCase()}.</p> : null}
    <section className="space-y-4">
      {visible.map(item => {
        const topic = String(item.payload?.topic || "General question");
        const isUnread = !item.read_at;
        return <article key={item.id} className={`rounded-3xl border bg-white p-6 shadow-sm ${isUnread ? "border-hgnBlue ring-1 ring-hgnBlue/20" : ""}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <input aria-label="Select message" type="checkbox" className="mt-1" checked={selected.has(item.id)} onChange={event => setSelected(current => { const next = new Set(current); event.target.checked ? next.add(item.id) : next.delete(item.id); return next })} />
              <div><div className="flex flex-wrap items-center gap-2">{isUnread ? <Badge>New</Badge> : null}{item.replied_at ? <Badge colour="emerald">Replied</Badge> : null}{item.priority === "high" ? <Badge colour="amber">Priority</Badge> : null}</div>
                <h2 className="mt-2 text-2xl font-bold text-hgnNavy">{topic}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.sender_name || "Unknown sender"} · <a className="font-semibold text-hgnBlue" href={`mailto:${item.sender_email || ""}`}>{item.sender_email || "No email"}</a></p>
                <p className="mt-1 text-xs text-slate-500">Received {item.created_at ? new Date(item.created_at).toLocaleString("en-CA") : "Unknown time"}{item.assigned_to ? ` · Assigned to ${item.assigned_to}` : ""}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-800">{item.message || "No message text."}</div>
          <div className="mt-5 flex flex-wrap gap-2">
            {!item.replied_at ? <button disabled={working === item.id || !item.sender_email} onClick={() => void startReply(item)} className="rounded-full bg-hgnBlue px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Reply</button> : null}
            {isUnread ? <button disabled={working === item.id} onClick={() => void updateItems([item], { read_at: new Date().toISOString(), status: "read" })} className="rounded-full border px-4 py-2 text-sm font-semibold">Mark read</button> : <button disabled={working === item.id} onClick={() => void updateItems([item], { read_at: null, status: "new" })} className="rounded-full border px-4 py-2 text-sm font-semibold">Mark unread</button>}
            {currentEmail && item.assigned_to !== currentEmail ? <button disabled={working === item.id} onClick={() => void updateItems([item], { assigned_to: currentEmail })} className="rounded-full border px-4 py-2 text-sm font-semibold">Assign to me</button> : null}
            {view !== "archive" ? <button disabled={working === item.id} onClick={() => void updateItems([item], { archived_at: new Date().toISOString(), status: item.replied_at ? "replied" : "archived" }, "Archived.")} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold">Archive</button> : <button disabled={working === item.id} onClick={() => void updateItems([item], { archived_at: null, status: item.replied_at ? "replied" : "read" }, "Restored.")} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold">Restore</button>}
            <button disabled={working === item.id} onClick={() => void deleteMessage(item)} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">Delete</button>
          </div>
          {replyingId === item.id ? <div className="mt-5 rounded-2xl border bg-slate-50 p-5"><h3 className="text-lg font-bold">Reply to {item.sender_name || item.sender_email}</h3><label className="mt-4 grid gap-2 text-sm font-semibold">Subject<input value={replySubject} onChange={event => setReplySubject(event.target.value)} className="rounded-xl border bg-white px-3 py-2 font-normal" /></label><label className="mt-4 grid gap-2 text-sm font-semibold">Message<textarea value={replyBody} onChange={event => setReplyBody(event.target.value)} rows={8} className="rounded-xl border bg-white px-3 py-2 font-normal" /></label><div className="mt-4 flex gap-2"><button disabled={working === item.id || !replyBody.trim()} onClick={() => void sendReply(item)} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Send reply</button><button onClick={() => setReplyingId("")} className="rounded-full border px-4 py-2 text-sm font-semibold">Cancel</button></div></div> : null}
        </article>
      })}
    </section>
  </main>
}
function rowTime(item: ContactMessage) { const parsed = new Date(item.created_at || 0).getTime(); return Number.isFinite(parsed) ? parsed : 0 }
function Tab({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) { return <button onClick={onClick} className={active ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white" : "rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"}>{children}</button> }
function Stat({ label, value, emphasis }: { label: string, value: number, emphasis?: boolean }) { return <div className={emphasis ? "rounded-2xl bg-blue-50 p-4" : "rounded-2xl bg-slate-100 p-4"}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div> }
function Badge({ children, colour = "blue" }: { children: React.ReactNode, colour?: "blue" | "emerald" | "amber" }) { const styles = { blue: "bg-blue-100 text-blue-800", emerald: "bg-emerald-100 text-emerald-800", amber: "bg-amber-100 text-amber-900" }; return <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${styles[colour]}`}>{children}</span> }
