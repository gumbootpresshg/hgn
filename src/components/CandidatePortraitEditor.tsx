"use client"

import { ChangeEvent, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type Props = { candidateName: string; slug: string; value?: string | null; onChange: (url: string | null) => void }

const outputWidth = 1200
const outputHeight = 1500

export default function CandidatePortraitEditor({ candidateName, slug, value, onChange }: Props) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [blackBackground, setBlackBackground] = useState(false)
  const [showEntirePhoto, setShowEntirePhoto] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl) }, [sourceUrl])
  const previewStyle = useMemo(() => ({ transform: `translate(${offsetX}%, ${offsetY}%) rotate(${rotation}deg) scale(${zoom})`, transformOrigin: "center", transition: "transform 120ms ease-out" }), [offsetX, offsetY, rotation, zoom])

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0]
    if (!next) return
    if (!next.type.startsWith("image/")) return setMessage("Choose a JPG, PNG, WebP or HEIC photo.")
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    setFile(next); setSourceUrl(URL.createObjectURL(next)); setZoom(1); setRotation(0); setOffsetX(0); setOffsetY(0); setMessage("")
  }

  async function uploadEditedPortrait() {
    if (!file || !sourceUrl) return
    if (!slug.trim()) return setMessage("Add the candidate’s public URL slug first, then upload the portrait.")
    setUploading(true); setMessage("")
    try {
      const image = new Image()
      image.src = sourceUrl
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("This image could not be read.")) })
      const canvas = document.createElement("canvas")
      canvas.width = outputWidth; canvas.height = outputHeight
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Image editor is unavailable in this browser.")
      context.fillStyle = blackBackground ? "#000000" : "#e8e3d9"
      context.fillRect(0, 0, outputWidth, outputHeight)
      const radians = rotation * Math.PI / 180
      const isSideways = Math.abs(rotation % 180) === 90
      const sourceWidth = isSideways ? image.height : image.width
      const sourceHeight = isSideways ? image.width : image.height
      const scale = (showEntirePhoto ? Math.min(outputWidth / sourceWidth, outputHeight / sourceHeight) : Math.max(outputWidth / sourceWidth, outputHeight / sourceHeight)) * zoom
      context.translate(outputWidth / 2 + (offsetX / 100) * outputWidth, outputHeight / 2 + (offsetY / 100) * outputHeight)
      context.rotate(radians)
      context.drawImage(image, -image.width * scale / 2, -image.height * scale / 2, image.width * scale, image.height * scale)
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((next) => next ? resolve(next) : reject(new Error("Could not create the edited portrait.")), "image/jpeg", 0.9))
      const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "")
      const path = `candidate-profiles/${safeSlug}-${crypto.randomUUID()}.jpg`
      const { error } = await supabase.storage.from("article-images").upload(path, blob, { cacheControl: "3600", contentType: "image/jpeg", upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from("article-images").getPublicUrl(path)
      onChange(data.publicUrl)
      setFile(null); setMessage("Portrait uploaded and attached. Save the candidate profile to publish it.")
    } catch (error: any) { setMessage(error?.message || "Portrait upload failed.") } finally { setUploading(false) }
  }

  return <div className="md:col-span-2 rounded-xl border border-stone-300 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">Portrait photo</p><p className="mt-1 text-sm leading-5 text-stone-600">Choose the original photo again whenever you need a different crop. The saved version is a finished 4:5 portrait.</p></div></div><div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]"><div className={`relative aspect-[4/5] overflow-hidden border ${blackBackground ? "border-stone-900 bg-black" : "border-stone-300 bg-[#e8e3d9]"}`}>{sourceUrl ? <img src={sourceUrl} alt="Portrait crop preview" className={`h-full w-full ${showEntirePhoto ? "object-contain" : "object-cover"}`} style={previewStyle}/> : value ? <img src={value} alt="Current candidate portrait" className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center p-5 text-center text-sm text-stone-500">No portrait selected</div>}</div><div className="grid content-start gap-4"><label className="font-bold">{value ? "Replace with original photo" : "Choose photo"}<input className="mt-1" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={chooseFile}/></label>{value && !sourceUrl ? <div className="flex flex-wrap gap-2"><button type="button" onClick={() => onChange(null)} className="border border-hgnRed px-3 py-2 text-sm font-bold text-hgnRed">Remove current photo</button><p className="self-center text-sm text-stone-600">To fix the crop, choose the original photo again.</p></div> : null}{sourceUrl ? <><div className="grid gap-3 sm:grid-cols-2"><label className="font-bold">Zoom<input className="mt-1" type="range" min="0.6" max="3" step="0.05" value={zoom} onChange={event => setZoom(Number(event.target.value))}/><span className="text-sm font-normal text-stone-600">{zoom.toFixed(2)}×</span></label><label className="font-bold">Move left / right<input className="mt-1" type="range" min="-50" max="50" step="1" value={offsetX} onChange={event => setOffsetX(Number(event.target.value))}/></label><label className="font-bold">Move up / down<input className="mt-1" type="range" min="-50" max="50" step="1" value={offsetY} onChange={event => setOffsetY(Number(event.target.value))}/></label><div className="grid gap-2 self-end"><label className="flex items-center gap-2 font-bold"><input className="w-auto" type="checkbox" checked={showEntirePhoto} onChange={event => setShowEntirePhoto(event.target.checked)}/>Show entire photo</label><label className="flex items-center gap-2 font-bold"><input className="w-auto" type="checkbox" checked={blackBackground} onChange={event => setBlackBackground(event.target.checked)}/>Black background</label></div></div><p className="text-sm leading-5 text-stone-600">For a headshot that is being cut off, turn on <strong>Show entire photo</strong> and use a black background. Move the photo down to leave more space above the head.</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setRotation(current => current - 90)} className="border border-stone-300 px-3 py-2 text-sm font-bold">↺ Rotate left</button><button type="button" onClick={() => setRotation(current => current + 90)} className="border border-stone-300 px-3 py-2 text-sm font-bold">Rotate right ↻</button><button type="button" onClick={() => { setZoom(1); setRotation(0); setOffsetX(0); setOffsetY(0); setShowEntirePhoto(false) }} className="border border-stone-300 px-3 py-2 text-sm font-bold">Reset crop</button><button type="button" onClick={() => void uploadEditedPortrait()} disabled={uploading} className="hgn-btn-primary">{uploading ? "Uploading…" : "Use this portrait"}</button></div></> : null}{message ? <p className="rounded border border-stone-200 bg-stone-50 p-3 text-sm font-bold text-stone-700">{message}</p> : null}</div></div><label className="mt-4 block font-bold">Portrait image URL (optional)<input className="mt-1" type="url" value={value || ""} onChange={event => onChange(event.target.value || null)} placeholder="Paste a public image URL, or use the uploader above."/></label></div>
}
