"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = { authorName: string; slug: string; value?: string | null; onChange: (url: string | null) => void };

const WIDTH = 1200;
const HEIGHT = 1200;

export default function AuthorPortraitEditor({ authorName, slug, value, onChange }: Props) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [blackBackground, setBlackBackground] = useState(false);
  const [showEntirePhoto, setShowEntirePhoto] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);
  const previewStyle = useMemo(() => ({ transform: `translate(${offsetX}%, ${offsetY}%) rotate(${rotation}deg) scale(${zoom})`, transformOrigin: "center" }), [offsetX, offsetY, rotation, zoom]);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0];
    if (!next) return;
    if (!next.type.startsWith("image/")) return setMessage("Choose a JPG, PNG, WebP or HEIC photo.");
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setFile(next); setSourceUrl(URL.createObjectURL(next)); setZoom(1); setRotation(0); setOffsetX(0); setOffsetY(0); setMessage("");
  }

  async function usePortrait() {
    if (!file || !sourceUrl) return;
    if (!slug.trim()) return setMessage("Save the author name first, then upload the portrait.");
    setUploading(true); setMessage("");
    try {
      const image = new Image(); image.src = sourceUrl;
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("This image could not be read.")); });
      const canvas = document.createElement("canvas"); canvas.width = WIDTH; canvas.height = HEIGHT;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image editor is unavailable in this browser.");
      context.fillStyle = blackBackground ? "#000" : "#e8e3d9"; context.fillRect(0, 0, WIDTH, HEIGHT);
      const radians = rotation * Math.PI / 180;
      const sideways = Math.abs(rotation % 180) === 90;
      const sourceWidth = sideways ? image.height : image.width;
      const sourceHeight = sideways ? image.width : image.height;
      const scale = (showEntirePhoto ? Math.min(WIDTH / sourceWidth, HEIGHT / sourceHeight) : Math.max(WIDTH / sourceWidth, HEIGHT / sourceHeight)) * zoom;
      context.translate(WIDTH / 2 + (offsetX / 100) * WIDTH, HEIGHT / 2 + (offsetY / 100) * HEIGHT);
      context.rotate(radians);
      context.drawImage(image, -image.width * scale / 2, -image.height * scale / 2, image.width * scale, image.height * scale);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((next) => next ? resolve(next) : reject(new Error("Could not create the portrait.")), "image/jpeg", 0.9));
      const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
      const path = `authors/${safeSlug}-${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("article-images").upload(path, blob, { cacheControl: "3600", contentType: "image/jpeg", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("article-images").getPublicUrl(path);
      onChange(data.publicUrl); setFile(null); setMessage("Portrait saved to this author profile.");
    } catch (error: any) { setMessage(error?.message || "Portrait upload failed."); } finally { setUploading(false); }
  }

  return <section className="mt-5 rounded-xl border border-stone-300 bg-stone-50 p-4">
    <p className="font-semibold">Author portrait</p><p className="mt-1 text-sm text-stone-600">Upload the original photo to crop a square headshot for the public author page.</p>
    <div className="mt-4 grid gap-4 md:grid-cols-[190px_minmax(0,1fr)]">
      <div className={`relative aspect-square overflow-hidden border ${blackBackground ? "border-black bg-black" : "border-stone-300 bg-[#e8e3d9]"}`}>
        {sourceUrl ? <img src={sourceUrl} alt="Portrait crop preview" className={`h-full w-full ${showEntirePhoto ? "object-contain" : "object-cover"}`} style={previewStyle} /> : value ? <img src={value} alt={`Current portrait for ${authorName}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center p-4 text-center text-sm text-stone-500">No portrait selected</div>}
      </div>
      <div className="grid content-start gap-3">
        <label className="font-semibold">{value ? "Replace with original photo" : "Choose photo"}<input className="mt-1 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={chooseFile} /></label>
        {value && !sourceUrl ? <button type="button" onClick={() => onChange(null)} className="w-fit border border-hgnRed px-3 py-2 text-sm font-bold text-hgnRed">Remove current photo</button> : null}
        {sourceUrl ? <><div className="grid gap-3 sm:grid-cols-2"><label className="font-semibold">Zoom<input className="mt-1 w-full" type="range" min="0.6" max="3" step="0.05" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /></label><label className="font-semibold">Move left / right<input className="mt-1 w-full" type="range" min="-50" max="50" value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} /></label><label className="font-semibold">Move up / down<input className="mt-1 w-full" type="range" min="-50" max="50" value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} /></label><div className="grid content-end gap-2 text-sm font-semibold"><label className="flex gap-2"><input type="checkbox" checked={showEntirePhoto} onChange={(e) => setShowEntirePhoto(e.target.checked)} /> Show entire photo</label><label className="flex gap-2"><input type="checkbox" checked={blackBackground} onChange={(e) => setBlackBackground(e.target.checked)} /> Black background</label></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setRotation((current) => current - 90)} className="border border-stone-300 px-3 py-2 text-sm font-bold">↺ Rotate</button><button type="button" onClick={() => setRotation((current) => current + 90)} className="border border-stone-300 px-3 py-2 text-sm font-bold">Rotate ↻</button><button type="button" onClick={() => { setZoom(1); setRotation(0); setOffsetX(0); setOffsetY(0); setShowEntirePhoto(false); }} className="border border-stone-300 px-3 py-2 text-sm font-bold">Reset crop</button><button type="button" onClick={() => void usePortrait()} disabled={uploading} className="hgn-btn-primary">{uploading ? "Uploading…" : "Use this portrait"}</button></div></> : null}
        {message ? <p className="rounded bg-white p-3 text-sm font-semibold text-stone-700">{message}</p> : null}
      </div>
    </div>
  </section>;
}
