"use client"

import { useState } from "react"

export default function MarketplaceShareActions({ title }: { title: string }) {
  const [message, setMessage] = useState("")

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setMessage("Link copied.")
    } catch {
      setMessage("Copy this link from your browser address bar.")
    }
  }

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Take a look at this Marketplace listing: ${title}`, url })
        return
      } catch (error: any) {
        if (error?.name === "AbortError") return
      }
    }
    await copyLink()
  }

  return (
    <div className="mt-6 border-t pt-6">
      <h2 className="text-xl font-black">Share this listing</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Send it by text, post it to social media, or copy the link anywhere.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => void share()} className="rounded-full bg-hgnBlue px-5 py-3 text-sm font-bold text-white">Share listing</button>
        <button type="button" onClick={() => void copyLink()} className="rounded-full border px-5 py-3 text-sm font-bold">Copy link</button>
      </div>
      {message ? <p aria-live="polite" className="mt-3 text-sm font-semibold text-slate-600">{message}</p> : null}
    </div>
  )
}
