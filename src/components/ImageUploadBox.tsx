"use client";

import { useState } from "react";

export default function ImageUploadBox({
  onUploaded,
  bucket = "article-images",
  usageType = "article",
}: {
  onUploaded?: (asset: any) => void;
  bucket?: string;
  usageType?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(formData: FormData) {
    setBusy(true);
    setError("");
    formData.set("bucket", bucket);
    formData.set("usage_type", usageType);

    const { data: sessionData } = await import("@/lib/supabase").then(({ supabase }) => supabase.auth.getSession());
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/media/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    const json = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(json.error || "Upload failed");
      return;
    }

    onUploaded?.(json.asset);
  }

  return (
    <form action={upload} className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="text-xl font-black text-hgnNavy">Upload optimized image</h3>
      <p className="mt-1 text-sm text-slate-600">The site stores optimized web images. Keep full-resolution originals in your archive/Drive.</p>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          Image
          <input name="file" type="file" accept="image/*" required className="rounded-lg border p-3" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          Caption
          <textarea name="caption" rows={2} className="rounded-lg border p-3" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          Photographer credit
          <input name="credit" placeholder="Submitted photo / Name / HGN" className="rounded-lg border p-3" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          Alt text
          <textarea name="alt_text" rows={2} placeholder="Describe what is in the photo for accessibility and Google." className="rounded-lg border p-3" />
        </label>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-hgnBlue">{error}</p>}
      <button disabled={busy} className="mt-4 rounded-full bg-hgnBlue px-5 py-3 text-sm font-black text-white disabled:opacity-60">
        {busy ? "Optimizing..." : "Upload image"}
      </button>
    </form>
  );
}
