import { supabase } from "@/lib/supabase"
import HouseAdPromo from "@/components/HouseAdPromo"

type AdSlotProps = {
  placement: string
  className?: string
  fallbackHouseAd?: boolean
}

export default async function AdSlot({
  placement,
  className = "",
  fallbackHouseAd = false,
}: AdSlotProps) {
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from("ads")
    .select("id,title,advertiser_name,image_url,destination_url,alt_text,html_code,rotation_weight,display_mode,max_width_px")
    .eq("placement_key", placement)
    .in("status", ["active", "published", "live"])
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(20)

  const ads = data || []

  if (ads.length === 0) {
    return fallbackHouseAd ? (
      <aside className={`my-6 ${className}`}>
        <HouseAdPromo compact />
      </aside>
    ) : null
  }

  const ad = pickWeightedAd(ads)
  const imageStyle = getAdImageStyle(ad, placement)

  return (
    <aside className={`my-6 rounded-2xl border bg-white p-3 shadow-sm ${className}`} style={imageStyle.wrapper}>
      {ad.html_code ? (
        <div dangerouslySetInnerHTML={{ __html: ad.html_code }} />
      ) : ad.image_url ? (
        ad.destination_url ? (
          <a href={ad.destination_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl" style={imageStyle.inner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.image_url} alt={ad.alt_text || ad.title || "Advertisement"} className="mx-auto h-auto max-w-full object-contain" style={imageStyle.image} />
          </a>
        ) : (
          <div className="overflow-hidden rounded-xl" style={imageStyle.inner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.image_url} alt={ad.alt_text || ad.title || "Advertisement"} className="mx-auto h-auto max-w-full object-contain" style={imageStyle.image} />
          </div>
        )
      ) : (
        <HouseAdPromo compact />
      )}
      <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        Advertisement
      </p>
    </aside>
  )
}

function pickWeightedAd(ads: any[]) {
  const expanded = ads.flatMap((ad) => Array(Math.max(1, Number(ad.rotation_weight || 1))).fill(ad))
  const index = Math.floor(Math.random() * expanded.length)
  return expanded[index] || ads[0]
}


function getAdImageStyle(ad: any, placement: string) {
  const mode = String(ad.display_mode || "recommended")
  const custom = Number(ad.max_width_px || 0)
  const recommended = placement.includes("article") ? 728 : placement.includes("sidebar") ? 300 : 970
  const maxWidth = mode === "full" ? undefined : mode === "custom" && custom > 0 ? custom : mode === "small" ? 300 : mode === "medium" ? 468 : mode === "leaderboard" ? 728 : recommended
  return {
    wrapper: maxWidth ? { maxWidth: `${maxWidth + 26}px`, marginLeft: "auto", marginRight: "auto" } : undefined,
    inner: maxWidth ? { maxWidth: `${maxWidth}px`, marginLeft: "auto", marginRight: "auto" } : undefined,
    image: maxWidth ? { maxWidth: `${maxWidth}px`, width: "100%" } : { width: "100%" },
  }
}
