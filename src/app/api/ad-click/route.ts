import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const to = url.searchParams.get("to") || "/advertise";
  if (id) await supabase.from("ad_click_events").insert({ ad_id: id, user_agent: req.headers.get("user-agent") || "" });
  const destination = to.startsWith("http") ? to : new URL(to, url.origin).toString();
  return NextResponse.redirect(destination);
}
