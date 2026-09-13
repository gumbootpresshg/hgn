"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DistributionTestButton({ url }: { url: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true); setMessage("");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setMessage("Login required."); setBusy(false); return; }
    const response = await fetch("/api/distribution/indexnow", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
    const result = await response.json().catch(() => ({}));
    if (result?.submitted) setMessage(`Submitted ${result.count || 1} URL to IndexNow.`);
    else setMessage(result?.message || result?.error || "Could not submit the URL.");
    setBusy(false);
  }
  return <div><button type="button" onClick={run} disabled={busy} className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-stone-700 disabled:opacity-50">{busy ? "Submitting..." : "Test IndexNow"}</button>{message ? <p className="mt-2 text-sm text-stone-600">{message}</p> : null}</div>;
}
