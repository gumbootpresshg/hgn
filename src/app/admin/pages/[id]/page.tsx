"use client"
import { useEffect,useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PageEditor } from "../PageEditor"
async function headers():Promise<Record<string,string>>{const{data}=await supabase.auth.getSession();return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{}}
export default function EditPage(){const params=useParams<{id:string}>();const[page,setPage]=useState<any>(null),[error,setError]=useState('');useEffect(()=>{void(async()=>{const r=await fetch(`/api/admin/site-pages/${params.id}`,{headers:await headers(),cache:'no-store'});const j=await r.json();if(r.ok)setPage(j.page);else setError(j.error||'Could not load page.')})()},[params.id]);if(error)return <main className="mx-auto max-w-4xl p-8"><div className="rounded-2xl border bg-white p-6">{error}</div></main>;if(!page)return <main className="mx-auto max-w-4xl p-8"><div className="rounded-2xl border bg-white p-6">Loading page…</div></main>;return <PageEditor initial={page}/>}
