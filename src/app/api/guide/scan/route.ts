import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hasPublisherAccess } from "@/lib/server/publisher-access";
import { parseGuideSource } from "@/lib/server/guide-source-parser";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key||!service)return NextResponse.json({error:"Supabase server settings are incomplete."},{status:500});
 const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/,'');if(!token)return NextResponse.json({error:'Login required.'},{status:401});
 const authClient=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});const{data:{user}}=await authClient.auth.getUser(token);if(!user)return NextResponse.json({error:'Session could not be verified.'},{status:401});if(!await hasPublisherAccess(authClient,user))return NextResponse.json({error:'Publisher access required.'},{status:403});
 const admin=createClient(url,service,{auth:{persistSession:false}});const body=await req.json().catch(()=>({}));let query=admin.from('hgn_guide_sources').select('*').eq('active',true).order('last_checked_at',{ascending:true,nullsFirst:true}).limit(Math.min(25,Math.max(1,Number(body.limit||12))));if(body.sourceId)query=query.eq('id',body.sourceId);const{data:sources,error}=await query;if(error)return NextResponse.json({error:error.message},{status:500});
 let checked=0,changed=0,findings=0,failed=0;
 for(const source of sources||[]){checked++;try{const res=await fetch(source.url,{headers:{'User-Agent':'HaidaGwaiiNews-GuideKeeper/1.0 (+https://haidagwaiinews.com)'},redirect:'follow',cache:'no-store',signal:AbortSignal.timeout(15000)});const html=await res.text();const parsed=parseGuideSource(html,res.url||source.url);const isChanged=Boolean(source.last_content_hash&&source.last_content_hash!==parsed.hash);if(isChanged)changed++;
 const proposed:any={};if(parsed.description)proposed.description=parsed.description;if(parsed.phone)proposed.phone=parsed.phone;if(parsed.address)proposed.address=parsed.address;if(parsed.hours)proposed.hours=parsed.hours;if(parsed.canonical)proposed.website=parsed.canonical;
 await admin.from('hgn_guide_sources').update({last_checked_at:new Date().toISOString(),last_http_status:res.status,last_content_hash:parsed.hash,last_changed_at:isChanged?new Date().toISOString():source.last_changed_at,last_status:res.ok?'checked':'http_error',last_error:res.ok?null:`HTTP ${res.status}`,updated_at:new Date().toISOString()}).eq('id',source.id);
 if(isChanged||!source.last_content_hash){const dedupe=`guide:${source.id}:${parsed.hash}`;const title=`Review ${source.name}`;const summary=[parsed.title&&`Page title: ${parsed.title}`,parsed.description&&`Description: ${parsed.description}`,parsed.phone&&`Phone: ${parsed.phone}`,parsed.address&&`Address: ${parsed.address}`,parsed.hours&&`Hours: ${parsed.hours}`].filter(Boolean).join('\n')||parsed.text.slice(0,900);const{error:fErr}=await admin.from('hgn_guide_findings').upsert({source_id:source.id,title,summary,proposed_changes:proposed,status:'pending',source_url:source.url,content_hash:parsed.hash,dedupe_key:dedupe,checked_at:new Date().toISOString()},{onConflict:'dedupe_key',ignoreDuplicates:true});if(!fErr)findings++;}
 }catch(err:any){failed++;await admin.from('hgn_guide_sources').update({last_checked_at:new Date().toISOString(),last_status:'error',last_error:String(err?.message||err).slice(0,500),updated_at:new Date().toISOString()}).eq('id',source.id)} }
 return NextResponse.json({checked,changed,findings,failed});
}
