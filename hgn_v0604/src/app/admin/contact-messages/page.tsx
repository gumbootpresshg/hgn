"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ContactMessage = {
  id: string;
  title?: string | null;
  sender_name?: string | null;
  sender_email?: string | null;
  message?: string | null;
  payload?: Record<string, any> | null;
  status?: string | null;
  priority?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  read_at?: string | null;
  archived_at?: string | null;
  assigned_to?: string | null;
  replied_at?: string | null;
  reply_count?: number | null;
  last_reply_subject?: string | null;
};

export default function ContactMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [replyingId, setReplyingId] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    const { data: auth } = await supabase.auth.getUser();
    setCurrentEmail(auth.user?.email || "");

    const query = supabase
      .from("submission_inbox")
      .select("*")
      .eq("submission_type", "contact_message")
      .order("created_at", { ascending: false })
      .limit(200);

    const { data, error } = showArchived ? await query.not("archived_at", "is", null) : await query.is("archived_at", null);
    if (error) setMessage(error.message);
    setItems((data || []) as ContactMessage[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [showArchived]);

  const unread = useMemo(() => items.filter((item) => !item.read_at).length, [items]);

  async function updateItem(id: string, values: Record<string, unknown>) {
    setWorking(id);
    setMessage("");
    const { error } = await supabase.from("submission_inbox").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) setMessage(error.message);
    else await load();
    setWorking("");
  }

  async function startReply(item: ContactMessage) {
    if (!item.read_at) await updateItem(item.id, { read_at: new Date().toISOString(), status: item.status === "new" ? "read" : item.status });
    setReplyingId(item.id);
    setReplySubject(item.last_reply_subject || `Re: ${String(item.title || "Your message to Haida Gwaii News").replace(/^Contact:\s*/i, "")}`);
    setReplyBody(`Hi ${item.sender_name || "there"},\n\n\n\nThanks,\nHaida Gwaii News`);
  }

  async function sendReply(item: ContactMessage) {
    setWorking(item.id);
    setMessage("");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setMessage("Your login session could not be verified. Please sign in again.");
      setWorking("");
      return;
    }

    const response = await fetch(`/api/admin/contact/${encodeURIComponent(item.id)}/reply`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ subject: replySubject, message: replyBody }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(result.error || "Reply could not be sent.");
    else {
      setMessage(`Reply sent to ${item.sender_email}.`);
      setReplyingId("");
      setReplyBody("");
      await load();
    }
    setWorking("");
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-hgnBlue">Audience</p>
        <h1 className="mt-3 font-serif text-5xl font-bold text-hgnNavy">Contact Messages</h1>
        <p className="mt-3 max-w-3xl text-slate-600">General correspondence belongs here, not in the editorial approval queue. Read, reply, assign and archive messages without pretending they need publishing approval.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">{items.length} {showArchived ? "archived" : "open"}</span>
          {!showArchived ? <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">{unread} unread</span> : null}
          <button onClick={() => setShowArchived((value) => !value)} className="rounded-full border px-4 py-2 text-sm font-semibold">{showArchived ? "Show open" : "Show archived"}</button>
          <button onClick={load} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Refresh</button>
        </div>
        {message ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
      </section>

      {loading ? <p className="rounded-2xl border bg-white p-6">Loading contact messages...</p> : null}
      {!loading && items.length === 0 ? <p className="rounded-2xl border bg-white p-6 text-slate-500">No {showArchived ? "archived" : "open"} contact messages.</p> : null}

      <section className="space-y-4">
        {items.map((item) => {
          const topic = String(item.payload?.topic || "General question");
          const isUnread = !item.read_at;
          return (
            <article key={item.id} className={`rounded-3xl border bg-white p-6 shadow-sm ${isUnread ? "border-hgnBlue ring-1 ring-hgnBlue/20" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isUnread ? <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold uppercase text-blue-800">New</span> : null}
                    {item.replied_at ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase text-emerald-800">Replied</span> : null}
                    {item.priority === "high" ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase text-amber-900">Priority</span> : null}
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-hgnNavy">{topic}</h2>
                  <p className="mt-1 text-sm text-slate-600">{item.sender_name || "Unknown sender"} · <a className="font-semibold text-hgnBlue" href={`mailto:${item.sender_email || ""}`}>{item.sender_email || "No email"}</a></p>
                  <p className="mt-1 text-xs text-slate-500">Received {item.created_at ? new Date(item.created_at).toLocaleString("en-CA") : "Unknown time"}{item.assigned_to ? ` · Assigned to ${item.assigned_to}` : ""}</p>
                </div>
              </div>

              <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-800">{item.message || "No message text."}</div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button disabled={working === item.id || !item.sender_email} onClick={() => startReply(item)} className="rounded-full bg-hgnBlue px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Reply</button>
                {isUnread ? <button disabled={working === item.id} onClick={() => updateItem(item.id, { read_at: new Date().toISOString(), status: "read" })} className="rounded-full border px-4 py-2 text-sm font-semibold">Mark read</button> : <button disabled={working === item.id} onClick={() => updateItem(item.id, { read_at: null, status: "new" })} className="rounded-full border px-4 py-2 text-sm font-semibold">Mark unread</button>}
                {currentEmail && item.assigned_to !== currentEmail ? <button disabled={working === item.id} onClick={() => updateItem(item.id, { assigned_to: currentEmail })} className="rounded-full border px-4 py-2 text-sm font-semibold">Assign to me</button> : null}
                {!showArchived ? <button disabled={working === item.id} onClick={() => updateItem(item.id, { archived_at: new Date().toISOString(), status: item.replied_at ? "replied" : "archived" })} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold">Archive</button> : <button disabled={working === item.id} onClick={() => updateItem(item.id, { archived_at: null, status: item.replied_at ? "replied" : "read" })} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold">Restore</button>}
              </div>

              {replyingId === item.id ? (
                <div className="mt-5 rounded-2xl border bg-slate-50 p-5">
                  <h3 className="text-lg font-bold">Reply to {item.sender_name || item.sender_email}</h3>
                  <label className="mt-4 grid gap-2 text-sm font-semibold">Subject<input value={replySubject} onChange={(event) => setReplySubject(event.target.value)} className="rounded-xl border bg-white px-3 py-2 font-normal" /></label>
                  <label className="mt-4 grid gap-2 text-sm font-semibold">Message<textarea value={replyBody} onChange={(event) => setReplyBody(event.target.value)} rows={8} className="rounded-xl border bg-white px-3 py-2 font-normal" /></label>
                  <div className="mt-4 flex gap-2">
                    <button disabled={working === item.id || !replyBody.trim()} onClick={() => sendReply(item)} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Send reply</button>
                    <button onClick={() => setReplyingId("")} className="rounded-full border px-4 py-2 text-sm font-semibold">Cancel</button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
