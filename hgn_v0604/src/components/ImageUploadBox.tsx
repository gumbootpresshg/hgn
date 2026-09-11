"use client";

import { FormEvent, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

function safePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "image";
}

async function resizeImage(file: File, maxWidth: number, quality: number) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the image.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Image conversion failed.")), "image/webp", quality);
  });
  return { blob, width, height };
}

export default function ImageUploadBox({
  onUploaded,
  bucket = "article-images",
  usageType = "article",
}: {
  onUploaded?: (asset: any) => void;
  bucket?: string;
  usageType?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setStatus("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Choose an image before clicking Upload image.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Image is too large. Please use a file under 12MB.");
      return;
    }

    setBusy(true);
    try {
      setStatus("Optimizing image in your browser...");
      const [web, thumb] = await Promise.all([
        resizeImage(file, 1600, 0.82),
        resizeImage(file, 500, 0.76),
      ]);
      const base = `${Date.now()}-${safePart(file.name.replace(/\.[^.]+$/, ""))}`;
      const folder = safePart(usageType).slice(0, 60);
      const webPath = `${folder}/${base}-web.webp`;
      const thumbPath = `${folder}/${base}-thumb.webp`;

      setStatus("Uploading image...");
      const webUpload = await supabase.storage.from(bucket).upload(webPath, web.blob, {
        contentType: "image/webp", cacheControl: "3600", upsert: false,
      });
      if (webUpload.error) throw webUpload.error;
      const thumbUpload = await supabase.storage.from(bucket).upload(thumbPath, thumb.blob, {
        contentType: "image/webp", cacheControl: "3600", upsert: false,
      });
      if (thumbUpload.error) throw thumbUpload.error;

      const webUrl = supabase.storage.from(bucket).getPublicUrl(webPath).data.publicUrl;
      const thumbUrl = supabase.storage.from(bucket).getPublicUrl(thumbPath).data.publicUrl;
      const caption = String(formData.get("caption") || "").trim().slice(0, 500);
      const credit = String(formData.get("credit") || "").trim().slice(0, 200);
      const altText = String(formData.get("alt_text") || "").trim().slice(0, 300);
      const asset = {
        bucket, original_filename: file.name, storage_path: webPath, public_url: webUrl,
        web_url: webUrl, thumbnail_url: thumbUrl, mime_type: "image/webp",
        size_bytes: web.blob.size, width: web.width, height: web.height,
        caption, credit, alt_text: altText, usage_type: folder, status: "active",
      };

      const saved = await supabase.from("media_assets").insert(asset).select("*").maybeSingle();
      if (saved.error) {
        console.warn("Image uploaded but media_assets record was not saved:", saved.error.message);
      }
      onUploaded?.(saved.data || asset);
      formRef.current?.reset();
      setStatus("Image uploaded. Review the preview and click Save front page.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="text-xl font-black text-hgnNavy">Upload optimized image</h3>
      <p className="mt-1 text-sm text-slate-600">The image is optimized securely in your browser, then uploaded using the same signed-in admin session as the rest of HGN.</p>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-1 text-sm font-bold text-slate-700">Image<input name="file" type="file" accept="image/*" required disabled={busy} className="rounded-lg border p-3" /></label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">Caption<textarea name="caption" rows={2} disabled={busy} className="rounded-lg border p-3" /></label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">Photographer credit<input name="credit" placeholder="Submitted photo / Name / HGN" disabled={busy} className="rounded-lg border p-3" /></label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">Alt text<textarea name="alt_text" rows={2} placeholder="Describe what is in the photo for accessibility and Google." disabled={busy} className="rounded-lg border p-3" /></label>
      </div>
      {error ? <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
      {status ? <p aria-live="polite" className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-700">{status}</p> : null}
      <button type="submit" disabled={busy} className="mt-4 rounded-full bg-hgnBlue px-5 py-3 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60">{busy ? "Uploading..." : "Upload image"}</button>
    </form>
  );
}
