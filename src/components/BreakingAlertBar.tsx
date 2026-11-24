import Link from "next/link";
import { supabase } from "@/lib/supabase";
import WeatherAlertBar from "@/components/WeatherAlertBar";
import RoadAlertBar from "@/components/RoadAlertBar";

const PUBLIC_ENVIRONMENT_CANADA_ALERTS = "https://weather.gc.ca/?alertsublayers=wx&wbdisable=false";
const PUBLIC_DRIVEBC = "https://www.drivebc.ca/";

export async function BreakingAlertBar() {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("site_alerts")
    .select("*")
    .eq("status", "active")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("priority", { ascending: false })
    .limit(3);

  const alerts = data || [];
  if (!alerts.length) return null;

  return <>{alerts.map((alert) => {
    // Older automated records may contain an API endpoint; always give readers
    // the public, human-readable source page instead.
    if (alert.kind === "weather") return <WeatherAlertBar key={alert.id} alert={{ ...alert, url: PUBLIC_ENVIRONMENT_CANADA_ALERTS }} />;

    if (alert.kind === "road") return <RoadAlertBar key={alert.id} alert={{ ...alert, url: PUBLIC_DRIVEBC }} />;

    const tone = alert.kind === "ferry" ? "bg-sky-500 text-white" : "bg-hgnBlue text-white";
    const inner = (
      <div className={`${tone} border-b border-black/10`}>
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-sm font-black">
          <span className="rounded-full bg-white/20 px-3 py-1 uppercase tracking-widest">{alert.label || alert.kind || "Alert"}</span>
          <span className="truncate">{alert.message}</span>
        </div>
      </div>
    );
    return alert.url ? <Link key={alert.id} href={alert.url}>{inner}</Link> : <div key={alert.id}>{inner}</div>;
  })}</>;
}
