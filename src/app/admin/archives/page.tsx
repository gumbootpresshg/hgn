"use client"
import { FormEvent,useEffect,useRef,useState } from "react"
import { Archive,CheckCircle2,Trash2,Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"

async function authHeaders():Promise<Record<string,string>>{const{data}=await supabase.auth.getSession();return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{}}

type UploadStage = "idle"|"preparing"|"pdf"|"cover"|"saving"|"done"


export default function ArchivesAdmin(){
  const[items,setItems]=useState<any[]>([]),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[stage,setStage]=useState<UploadStage>('idle'),[progress,setProgress]=useState(0)
  const formRef=useRef<HTMLFormElement>(null)
  async function load(){const r=await fetch('/api/admin/archives',{headers:await authHeaders(),cache:'no-store'});const j=await r.json();if(r.ok)setItems(j.editions||[]);else setMsg(j.error||'Could not load editions.')}
  useEffect(()=>{void load()},[])

  async function directUpload(file:File,kind:'pdf'|'cover',issueDate:string){
    const prep=await fetch('/api/admin/archives/upload-url',{method:'POST',headers:{...(await authHeaders()),'Content-Type':'application/json'},body:JSON.stringify({kind,filename:file.name,contentType:file.type,size:file.size,issueDate})})
    const prepared=await prep.json().catch(()=>({}))
    if(!prep.ok)throw new Error(prepared.error||'Could not prepare file upload.')
    setStage(kind==='pdf'?'pdf':'cover')
    setProgress(kind==='pdf'?20:70)
    const {error}=await supabase.storage.from(prepared.bucket).uploadToSignedUrl(prepared.path,prepared.token,file,{contentType:file.type||undefined,upsert:false})
    if(error)throw new Error(error.message)
    setProgress(kind==='pdf'?65:88)
    return String(prepared.publicUrl||'')
  }

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMsg('');setStage('preparing');setProgress(8)
    const form=new FormData(e.currentTarget)
    const issueDate=String(form.get('issue_date')||'')
    const pdf=form.get('pdf') instanceof File?form.get('pdf') as File:null
    const cover=form.get('cover') instanceof File?form.get('cover') as File:null
    try{
      let pdfUrl=String(form.get('pdf_url')||'').trim()
      let coverUrl=''
      if(pdf&&pdf.size)pdfUrl=await directUpload(pdf,'pdf',issueDate)
      if(cover&&cover.size)coverUrl=await directUpload(cover,'cover',issueDate)
      setStage('saving');setProgress(94)
      const payload={title:String(form.get('title')||''),issue_date:issueDate,description:String(form.get('description')||''),pdf_url:pdfUrl,cover_image_url:coverUrl,flipbook_url:String(form.get('flipbook_url')||''),status:String(form.get('status')||'draft'),featured:String(form.get('featured')||'false')==='true'}
      const r=await fetch('/api/admin/archives',{method:'POST',headers:{...(await authHeaders()),'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Could not save edition.')
      setStage('done');setProgress(100);setMsg('Edition uploaded and saved to the newsstand.');formRef.current?.reset();await load()
      window.setTimeout(()=>{setStage('idle');setProgress(0)},2200)
    }catch(error:any){setMsg(error?.message||'Could not upload edition.');setStage('idle');setProgress(0)}finally{setBusy(false)}
  }
  async function patch(id:string,body:any){const r=await fetch(`/api/admin/archives/${id}`,{method:'PATCH',headers:{...(await authHeaders()),'Content-Type':'application/json'},body:JSON.stringify(body)});if(r.ok)await load()}
  async function del(id:string){if(!confirm('Delete this archive record?'))return;const r=await fetch(`/api/admin/archives/${id}`,{method:'DELETE',headers:await authHeaders()});if(r.ok)await load()}
  const stageLabel=stage==='preparing'?'Preparing upload…':stage==='pdf'?'Uploading newspaper PDF directly to storage…':stage==='cover'?'Uploading cover image…':stage==='saving'?'Saving edition details…':stage==='done'?'Edition ready on the newsstand':'Uploading…'
  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6"><section className="rounded-3xl border bg-white p-8 shadow-sm"><p className="text-sm font-black uppercase tracking-[.18em] text-hgnBlue">Archives</p><h1 className="mt-2 font-serif text-5xl font-bold">Newsstand manager</h1><p className="mt-3 max-w-3xl text-slate-600">Upload print editions, cover images and PDFs. Large newspaper PDFs upload directly to storage so they do not have to pass through the website server.</p></section>{msg&&<div className="rounded-2xl border bg-white p-4 font-bold">{msg}</div>}<form ref={formRef} onSubmit={submit} className="grid gap-4 rounded-3xl border bg-white p-6 shadow-sm md:grid-cols-2"><label>Edition title<input name="title" required placeholder="Issue 59 · August 27, 2026"/></label><label>Issue date<input name="issue_date" type="date" required/></label><label className="md:col-span-2">Description<textarea name="description" rows={3}/></label><label>PDF edition<input name="pdf" type="file" accept="application/pdf"/><span className="mt-1 block text-xs text-slate-500">Up to 120 MB. Uploaded directly to archive storage.</span></label><label>Cover image<input name="cover" type="file" accept="image/*"/><span className="mt-1 block text-xs text-slate-500">Optional. Up to 20 MB.</span></label><label>Existing PDF URL<input name="pdf_url" placeholder="Optional if not uploading"/></label><label>Flipbook URL<input name="flipbook_url" placeholder="Optional external reader"/></label><label>Status<select name="status" defaultValue="published"><option value="draft">Draft</option><option value="published">Published</option></select></label><label className="flex items-center gap-2"><input name="featured" value="true" type="checkbox"/> Feature this edition</label>{busy&&<div className="md:col-span-2 rounded-2xl border bg-stone-50 p-4"><div className="flex items-center justify-between gap-4 text-sm font-bold"><span>{stageLabel}</span><span>{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-slate-900 transition-all duration-500" style={{width:`${progress}%`}}/></div><p className="mt-2 text-xs text-slate-500">Keep this tab open until the edition says it is ready.</p></div>}<button disabled={busy} className="hgn-btn-primary inline-flex items-center justify-center gap-2 md:col-span-2">{stage==='done'?<CheckCircle2 size={17}/>:<Upload size={17}/>} {busy?stageLabel:'Add edition to newsstand'}</button></form><section className="space-y-3">{items.map(i=><article key={i.id} className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-[90px_1fr_auto]"><div className="flex h-28 items-center justify-center overflow-hidden rounded border bg-stone-100">{i.cover_image_url?<img src={i.cover_image_url} alt="" className="h-full w-full object-cover"/>:<Archive/>}</div><div><h2 className="text-xl font-black">{i.title}</h2><p className="text-sm text-slate-500">{i.issue_date} · {i.status}</p>{i.pdf_url&&<p className="mt-1 text-xs text-slate-400">PDF stored in archive</p>}<div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>void patch(i.id,{status:i.status==='published'?'draft':'published'})} className="rounded-full border px-3 py-1.5 text-sm font-bold">{i.status==='published'?'Unpublish':'Publish'}</button><button onClick={()=>void patch(i.id,{featured:!i.featured})} className="rounded-full border px-3 py-1.5 text-sm font-bold">{i.featured?'Unfeature':'Feature'}</button>{i.pdf_url&&<a href={i.pdf_url} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1.5 text-sm font-bold">Open PDF</a>}</div></div><button onClick={()=>void del(i.id)} className="self-start rounded-full border p-2 text-red-700"><Trash2 size={16}/></button></article>)}</section></main>}
