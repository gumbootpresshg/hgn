"use client";

import { FormEvent, useState } from "react";

type Status = { kind: "idle" | "sending" | "success" | "error"; message?: string };

const topics = [
  "General question",
  "News tip",
  "Advertising",
  "Subscription",
  "Public notice",
  "Obituary",
  "Correction",
  "Letter to the editor",
];

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      topic: String(data.get("topic") || "General question").trim(),
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || "").trim(),
    };

    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || "We could not send your message.");
      }

      form.reset();
      setStatus({
        kind: "success",
        message: "Thanks. Your message has been sent to Haida Gwaii News.",
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "We could not send your message. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-hgnNavy">
          Name
          <input
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            className="rounded-2xl border px-4 py-3 font-normal text-slate-900"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-hgnNavy">
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="rounded-2xl border px-4 py-3 font-normal text-slate-900"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-hgnNavy">
        What is this about?
        <select
          name="topic"
          className="rounded-2xl border px-4 py-3 font-normal text-slate-900"
          defaultValue="General question"
        >
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold text-hgnNavy">
        Message
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={10000}
          rows={7}
          className="rounded-2xl border px-4 py-3 font-normal text-slate-900"
        />
      </label>

      {status.kind === "success" ? (
        <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          {status.message}
        </p>
      ) : null}

      {status.kind === "error" ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900">
          {status.message}
        </p>
      ) : null}

      <button
        className="hgn-btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={status.kind === "sending"}
      >
        {status.kind === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
