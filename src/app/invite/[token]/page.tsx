"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Invite = { id:string; email:string; role:string; token:string; status:string };

export default function InviteSignup({ params }: { params: { token: string } }) {
  const [invite,setInvite]=useState<Invite|null>(null);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  useEffect(()=>{ load(); },[]);

  async function load(){
    const { data, error } = await supabase.from("contributor_invites").select("*").eq("token", params.token).eq("status", "pending").single();
    if(error) setMessage("This invitation link is invalid or already used.");
    setInvite(data as Invite | null);
    setLoading(false);
  }

  async function signup(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!invite) return;
    setMessage("");
    const f = new FormData(e.currentTarget);
    const full_name = String(f.get("full_name") || invite.email.split("@")[0]);
    const password = String(f.get("password"));
    const { data, error } = await supabase.auth.signUp({ email: invite.email, password, options: { data: { full_name } } });
    if(error){ setMessage(error.message); return; }
    if(data.user){
      await supabase.from("profiles").upsert({ id:data.user.id, full_name, role:invite.role });
      await supabase.from("contributor_invites").update({ status:"accepted", accepted_by:data.user.id, accepted_at:new Date().toISOString() }).eq("id", invite.id);
    }
    setMessage("Account created. Check your email if confirmation is enabled, then log in.");
  }

  if(loading) return <main className="mx-auto max-w-xl px-4 py-10"><div className="hgn-card p-6">Loading invite...</div></main>;
  if(!invite) return <main className="mx-auto max-w-xl px-4 py-10"><div className="hgn-card p-6"><h1 className="text-3xl font-black text-hgnNavy">Invite not available</h1><p className="mt-2 text-slate-600">{message}</p><Link href="/login" className="hgn-btn-primary mt-5">Go to login</Link></div></main>;

  return <main className="mx-auto max-w-xl px-4 py-10">
    <div className="hgn-card p-6">
      <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Invitation</div>
      <h1 className="mt-2 text-4xl font-black text-hgnNavy">Create your contributor account</h1>
      <p className="mt-3 text-slate-700">This invite is for <b>{invite.email}</b>. Role: <b>{invite.role}</b>.</p>
      <form onSubmit={signup} className="mt-6 grid gap-4">
        <label>Name<input name="full_name" required /></label>
        <label>Email<input value={invite.email} disabled /></label>
        <label>Password<input name="password" type="password" required minLength={8} /></label>
        <button className="hgn-btn-primary">Create account</button>
      </form>
      {message && <p className="mt-4 font-semibold text-hgnNavy">{message}</p>}
    </div>
  </main>;
}
