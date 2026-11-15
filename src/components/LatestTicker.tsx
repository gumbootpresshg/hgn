"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"

type TickerStory = { id: string; slug: string; title: string }

export default function LatestTicker({ stories }: { stories: TickerStory[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const pauseUntilRef = useRef(0)
  const draggingRef = useRef<{ startX: number; scrollLeft: number } | null>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track || stories.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    const tick = () => {
      if (Date.now() > pauseUntilRef.current && track.scrollWidth > track.clientWidth + 8) {
        const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1
        track.scrollLeft = atEnd ? 0 : track.scrollLeft + 0.35
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [stories.length])

  function pause() { pauseUntilRef.current = Date.now() + 2800 }

  return <div
    ref={trackRef}
    className="min-w-0 flex flex-1 cursor-grab items-center gap-5 overflow-x-auto whitespace-nowrap text-stone-700 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    onPointerDown={(event) => { draggingRef.current = { startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft }; pause(); event.currentTarget.setPointerCapture(event.pointerId) }}
    onPointerMove={(event) => { const drag = draggingRef.current; if (!drag) return; event.currentTarget.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX); pause() }}
    onPointerUp={() => { draggingRef.current = null; pause() }}
    onPointerCancel={() => { draggingRef.current = null }}
    onFocus={pause}
  >
    {stories.map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="block max-w-[70vw] shrink-0 truncate hover:text-hgnRed sm:max-w-[26rem]">{article.title}</Link>)}
  </div>
}
