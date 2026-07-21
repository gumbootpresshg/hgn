"use client"

import { useEffect, useMemo, useState } from "react"

export default function ArticleShare({ title }: { title: string }) {
  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  const links = useMemo(() => {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    return [
      { label: "Facebook", href: url ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` : "#" },
      { label: "X", href: url ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` : "#" },
      { label: "LinkedIn", href: url ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` : "#" },
      { label: "Email", href: url ? `mailto:?subject=${encodedTitle}&body=${encodedUrl}` : "#" },
    ]
  }, [title, url])

  async function copy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="rounded-3xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Share this article</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.label === "Email" || !url ? undefined : "_blank"}
            rel={link.label === "Email" || !url ? undefined : "noreferrer"}
            aria-disabled={!url}
            onClick={(event) => {
              if (!url) event.preventDefault()
            }}
            className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-hgnBlue"
          >
            {link.label}
          </a>
        ))}
        <button onClick={copy} disabled={!url} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
          {copied ? "Copied" : "Copy Link"}
        </button>
      </div>
    </section>
  )
}
