"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type StaffMessage = {
  id: string;
  created_at: string;
  author_email?: string;
  topic?: string;
  message?: string;
};

type Commitment = {
  id: string;
  created_at: string;
  contributor_email?: string;
  contributor_name?: string;
  issue_date?: string;
  submission_type?: string;
  title?: string;
  notes?: string;
  status?: string;
};

const submissionTypes = ["Short brief", "Half page", "Full page", "Column", "Photos only", "Photos + story", "Sports recap", "Editorial/Opinion"];

export default function StaffRoomPage() {
  const [userEmail, setUserEmail] = useState("");
  const [messages, setMessages] = useState<StaffMessage[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const email = auth.user?.email || "";
    setUserEmail(email);

    const [{ data: msg }, { data: comm }] = await Promise.all([
      supabase.from("staff_messages").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("contributor_commitments").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

    setMessages(msg || []);
    setCommitments(comm || []);
    setLoading(false);
  }

  async function postMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      author_email: userEmail || String(form.get("author_email") || ""),
      topic: String(form.get("topic") || "General"),
      message: String(form.get("message") || ""),
    };
    const { error } = await supabase.from("staff_messages").insert(payload);
    if (error) setNotice(error.message);
    else {
      setNotice("Message posted.");
      event.currentTarget.reset();
      load();
    }
  }

  async function postCommitment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      contributor_email: userEmail || String(form.get("contributor_email") || ""),
      contributor_name: String(form.get("contributor_name") || ""),
      issue_date: String(form.get("issue_date") || "") || null,
      submission_type: String(form.get("submission_type") || "Half page"),
      title: String(form.get("title") || ""),
      notes: String(form.get("notes") || ""),
      status: "planned",
    };
    const { error } = await supabase.from("contributor_commitments").insert(payload);
    if (error) setNotice(error.message);
    else {
      setNotice("Submission plan saved.");
      event.currentTarget.reset();
      load();
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="border-b pb-6">
        <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Private newsroom</div>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Staff Room</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          A simple place for editors, contributors and staff to coordinate upcoming editions, story ideas, photo needs and print-space commitments.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/articles" className="hgn-btn-primary">Article manager</Link>
          <Link href="/admin/reminders" className="hgn-btn-primary">Contributor reminders</Link>
          <Link href="/admin" className="hgn-btn-dark">Command Centre</Link>
        </div>
      </div>

      {notice && <div className="mt-5 rounded-xl border bg-white p-4 font-semibold text-hgnNavy">{notice}</div>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-6">
          <form onSubmit={postMessage} className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Newsroom chat</h2>
            {!userEmail && <label className="mt-4 block font-bold">Your email<input name="author_email" className="mt-1" required /></label>}
            <label className="mt-4 block font-bold">Topic<input name="topic" className="mt-1" placeholder="Front page, sports, photos, layout, advertiser note..." /></label>
            <label className="mt-4 block font-bold">Message<textarea name="message" rows={5} className="mt-1" required placeholder="What does the team need to know?" /></label>
            <button className="hgn-btn-primary mt-4">Post message</button>
          </form>

          <div className="grid gap-4">
            {loading && <div className="hgn-card p-6">Loading...</div>}
            {messages.map((m) => (
              <article key={m.id} className="hgn-card p-5">
                <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{m.topic || "General"}</div>
                <p className="mt-2 whitespace-pre-wrap text-lg leading-7 text-slate-800">{m.message}</p>
                <p className="mt-3 text-sm text-slate-500">{m.author_email || "Staff"} · {new Date(m.created_at).toLocaleString()}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <form onSubmit={postCommitment} className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">What are you submitting?</h2>
            <p className="mt-2 text-sm text-slate-600">Contributors can indicate whether they are sending a half page, full page, column, photos, or other material.</p>
            {!userEmail && <label className="mt-4 block font-bold">Email<input name="contributor_email" className="mt-1" required /></label>}
            <label className="mt-4 block font-bold">Name<input name="contributor_name" className="mt-1" /></label>
            <label className="mt-4 block font-bold">Issue date<input type="date" name="issue_date" className="mt-1" /></label>
            <label className="mt-4 block font-bold">Submission type<select name="submission_type" className="mt-1">{submissionTypes.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="mt-4 block font-bold">Working title<input name="title" className="mt-1" /></label>
            <label className="mt-4 block font-bold">Notes<textarea name="notes" rows={4} className="mt-1" placeholder="Photo count, expected length, deadline concerns..." /></label>
            <button className="hgn-btn-primary mt-4">Save plan</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-xl font-black text-hgnNavy">Upcoming commitments</h2>
            <div className="mt-4 grid gap-3">
              {commitments.slice(0, 10).map((c) => (
                <div key={c.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="font-black text-slate-900">{c.title || c.submission_type}</div>
                  <div className="text-sm text-slate-600">{c.contributor_name || c.contributor_email || "Contributor"}</div>
                  <div className="text-xs font-bold uppercase text-hgnBlue">{c.submission_type} {c.issue_date ? `· ${c.issue_date}` : ""}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
