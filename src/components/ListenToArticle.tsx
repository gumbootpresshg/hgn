"use client"

import { useRef, useState } from "react"

export default function ListenToArticle({ title, text }: { title: string; text: string }) {
  const [playing, setPlaying] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  function clean(value: string) {
    return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  }

  function toggle() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(`${title}. ${clean(text)}`)
    utterance.rate = 0.95
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)
    utteranceRef.current = utterance
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setPlaying(true)
  }

  return (
    <button onClick={toggle} className="mt-3 inline-flex rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide hover:border-hgnBlue">
      {playing ? "Stop listening" : "Listen to this article"}
    </button>
  )
}
