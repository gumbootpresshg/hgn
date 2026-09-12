import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const QUERIES = [
  "Haida Gwaii events calendar", "Haida Gwaii community events", "Haida Gwaii festival events",
  "Haida Gwaii recreation events", "Haida Gwaii arts events", "Haida Gwaii school events",
]
function cleanText(html: string) { return html.replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim() }
function absoluteDuckUrl(value: string) { try { const decoded=decodeURIComponent(value); const m=decoded.match(/[?&]uddg=([^&]+)/); return m?decodeURIComponent(m[1]):decoded } catch { return value } }
function candidates(html: string) {
  const out:{name:string;url:string}[]=[]; const re=/<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi; let m:RegExpExecArray|null
  while((m=re.exec(html))&&out.length<20){ const url=absoluteDuckUrl(m[1]).replace(/&amp;/g,"&"); const name=cleanText(m[2]).slice(0,140); if(/^https?:\/\//i.test(url)&&name) out.push({name,url}) }
  return out
}
export async function GET(req: NextRequest) {
  const secret=process.env.CRON_SECRET
  if(!secret || req.headers.get("authorization")!==`Bearer ${secret}`) return NextResponse.json({error:"Unauthorized"},{status:401})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const service=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!service) return NextResponse.json({error:"Supabase server settings incomplete."},{status:500})
  const db=createClient(url,service,{auth:{persistSession:false}})
  const {data:existing}=await db.from("hgn_event_sources").select("url")
  const known=new Set((existing||[]).map((x:any)=>{try{return new URL(x.url).hostname.replace(/^www\./,"")}catch{return String(x.url||"")}}))
  let added=0
  for(const query of QUERIES){
    try{
      const response=await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,{cache:"no-store",headers:{"User-Agent":"HaidaGwaiiNews/1.0 source discovery"},signal:AbortSignal.timeout(12000)})
      if(!response.ok) continue
      for(const candidate of candidates(await response.text())){
        let host=""; try{host=new URL(candidate.url).hostname.replace(/^www\./,"")}catch{continue}
        if(!host||known.has(host)||/facebook\.com|instagram\.com|youtube\.com|x\.com|twitter\.com/i.test(host)) continue
        known.add(host)
        const {error}=await db.from("hgn_event_sources").insert({name:candidate.name,url:candidate.url,community:null,active:false,source_type:"discovered",quality_score:0.5,max_candidates:5,source_lifecycle:"candidate",review_status:"candidate",discovered_at:new Date().toISOString(),last_discovered_at:new Date().toISOString(),discovered_query:query,discovery_note:"Automatically discovered by scheduled source discovery. Review before trusting."})
        if(!error) added++
      }
    }catch{}
  }
  return NextResponse.json({ok:true,added,ran_at:new Date().toISOString()})
}
