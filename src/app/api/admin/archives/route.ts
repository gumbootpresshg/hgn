import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"

export const runtime = "nodejs"

function safeName(value:string){return value.toLowerCase().replace(/[^a-z0-9.]+/g,'-').replace(/^-|-$/g,'')||'file'}

export async function GET(req: NextRequest){
  const auth=await requirePublisher(req); if(!auth.ok)return NextResponse.json({error:auth.error},{status:auth.status})
  const {data,error}=await auth.db.from('digital_editions').select('*').order('issue_date',{ascending:false})
  if(error)return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({editions:data||[]})
}

export async function POST(req: NextRequest){
  const auth=await requirePublisher(req); if(!auth.ok)return NextResponse.json({error:auth.error},{status:auth.status})
  const body=await req.json().catch(()=>null)
  if(!body)return NextResponse.json({error:'Invalid archive request.'},{status:400})
  const title=String(body.title||'').trim(); const issueDate=String(body.issue_date||'').trim();
  if(!title||!issueDate)return NextResponse.json({error:'Title and issue date are required.'},{status:400})
  const pdfUrl=String(body.pdf_url||'').trim()||null
  const coverUrl=String(body.cover_image_url||'').trim()||null
  const row={title,issue_date:issueDate,description:String(body.description||'').trim()||null,cover_image_url:coverUrl,pdf_url:pdfUrl,flipbook_url:String(body.flipbook_url||'').trim()||null,status:String(body.status||'draft'),featured:Boolean(body.featured),year:Number(issueDate.slice(0,4))||null,slug:`${issueDate}-${safeName(title)}`,updated_at:new Date().toISOString()}
  const {data,error}=await auth.db.from('digital_editions').insert(row).select().single(); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({edition:data})
}
