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
  const form=await req.formData(); const title=String(form.get('title')||'').trim(); const issueDate=String(form.get('issue_date')||'').trim();
  if(!title||!issueDate)return NextResponse.json({error:'Title and issue date are required.'},{status:400})
  let pdfUrl=String(form.get('pdf_url')||'').trim()||null; let coverUrl=String(form.get('cover_image_url')||'').trim()||null
  const pdf=form.get('pdf'); const cover=form.get('cover')
  if(pdf instanceof File && pdf.size){ if(pdf.type!=='application/pdf')return NextResponse.json({error:'Edition file must be a PDF.'},{status:400}); if(pdf.size>60*1024*1024)return NextResponse.json({error:'PDF must be under 60MB.'},{status:400}); const path=`archives/${issueDate}-${Date.now()}-${safeName(pdf.name)}`; const {error}=await auth.db.storage.from('hgn-media').upload(path,Buffer.from(await pdf.arrayBuffer()),{contentType:'application/pdf',upsert:false}); if(error)return NextResponse.json({error:error.message},{status:500}); pdfUrl=auth.db.storage.from('hgn-media').getPublicUrl(path).data.publicUrl }
  if(cover instanceof File && cover.size){ if(!cover.type.startsWith('image/'))return NextResponse.json({error:'Cover must be an image.'},{status:400}); if(cover.size>12*1024*1024)return NextResponse.json({error:'Cover image must be under 12MB.'},{status:400}); const path=`archives/covers/${issueDate}-${Date.now()}-${safeName(cover.name)}`; const {error}=await auth.db.storage.from('hgn-media').upload(path,Buffer.from(await cover.arrayBuffer()),{contentType:cover.type,upsert:false}); if(error)return NextResponse.json({error:error.message},{status:500}); coverUrl=auth.db.storage.from('hgn-media').getPublicUrl(path).data.publicUrl }
  const row={title,issue_date:issueDate,description:String(form.get('description')||'').trim()||null,cover_image_url:coverUrl,pdf_url:pdfUrl,flipbook_url:String(form.get('flipbook_url')||'').trim()||null,status:String(form.get('status')||'draft'),featured:String(form.get('featured')||'false')==='true',year:Number(issueDate.slice(0,4))||null,slug:`${issueDate}-${safeName(title)}`,updated_at:new Date().toISOString()}
  const {data,error}=await auth.db.from('digital_editions').insert(row).select().single(); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({edition:data})
}
