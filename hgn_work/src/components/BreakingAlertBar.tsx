import Link from "next/link";
import { supabase } from "@/lib/supabase";

export async function BreakingAlertBar() {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("site_alerts")
    .select("*")
    .eq("status", "active")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("priority", { ascending: false })
    .limit(1);

  const alert = data?.[0];
  if (!alert) return null;

  const tone = alert.kind === "weather" ? "bg-amber-400 text-hgnNavy" : alert.kind === "ferry" ? "bg-sky-500 text-white" : "bg-hgnBlue text-white";
  const inner = (
    <div className={`${tone} border-b border-black/10`}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-sm font-black">
        <span className="rounded-full bg-white/20 px-3 py-1 uppercase tracking-widest">{alert.label || alert.kind || "Alert"}</span>
        <span className="truncate">{alert.message}</span>
      </div>
    </div>
  );
  return alert.url ? <Link href={alert.url}>{inner}</Link> : inner;
}
