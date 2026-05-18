"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Invite = { id:string; email:string; role:string; token:string; status:string; created_at:string };

export default function InvitesPage(){
  const [role,setRole]=useState("");
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [invites,setInvites]=useState<Invite[]>([]);

  useEffect(()=>{ check(); },[]);

  async function check(){
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if(!data.user){ setLoading(false); return; }
    const email = data.user.email || "";
    const { data: roleRow } = await supabase.from("user_roles").select("role").ilike("email", email).maybeSingle();
    if (roleRow?.role) { setRole(roleRow.role); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    const r = profile?.role || "";
    setRole(r);
    if(["admin","editor"].includes(r)) await loadInvites();
    setLoading(false);
  }

  async function loadInvites(){
    const { data, error } = await supabase.from("contributor_invites").select("*").order("created_at", { ascending:false }).limit(50);
    if(error) setMessage(error.message);
    setInvites((data || []) as Invite[]);
  }

  async function createInvite(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setMessage("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim().toLowerCase();
    const inviteRole = String(f.get("role") || "contributor");
    const token = crypto.randomUUID();
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("contributor_invites").insert({ email, role: inviteRole, token, invited_by: userData.user?.id });
    if(error){ setMessage(error.message); return; }
    setMessage(`Invite created for ${email}. Copy the signup link below and email it to them.`);
    await loadInvites();
    (e.currentTarget as HTMLFormElement).reset();
  }

  if(loading) return <main className="mx-auto max-w-3xl px-4 py-10"><div className="hgn-card p-6">Loading...</div></main>;
  if(!["admin","editor"].includes(role)) return <main className="mx-auto max-w-3xl px-4 py-10"><div className="hgn-card p-6"><h1 className="text-3xl font-black text-hgnNavy">Admin only</h1><p className="mt-2 text-slate-600">Only admins/editors can invite contributors.</p><Link className="hgn-btn-primary mt-5" href="/login">Login</Link></div></main>;

  return <main className="mx-auto max-w-5xl px-4 py-10">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Admin</div><h1 className="mt-2 text-5xl font-black text-hgnNavy">Contributor Invitations</h1><p className="mt-2 text-slate-600">Create invite-only signup links for columnists, writers, photographers and advertisers.</p></div>
      <Link href="/admin" className="hgn-btn-dark">Back to dashboard</Link>
    </div>

    <form onSubmit={createInvite} className="hgn-card mt-8 grid gap-4 p-6 md:grid-cols-[1fr_220px_auto] md:items-end">
      <label>Email<input name="email" type="email" required placeholder="writer@example.com" /></label>
      <label>Role<select name="role"><option value="contributor">Contributor</option><option value="columnist">Columnist</option><option value="advertiser">Advertiser</option><option value="editor">Editor</option></select></label>
      <button className="hgn-btn-primary">Create invite</button>
    </form>
    {message && <div className="hgn-card mt-5 p-4 font-semibold text-hgnNavy">{message}</div>}

    <div className="mt-8 grid gap-4">
      {invites.map((invite)=>{
        const link = typeof window !== "undefined" ? `${window.location.origin}/invite/${invite.token}` : `/invite/${invite.token}`;
        const body = encodeURIComponent(`You have been invited to create a Haida Gwaii News contributor account. Use this link: ${link}`);
        return <article key={invite.id} className="hgn-card p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div><div className="text-xs font-black uppercase text-hgnBlue">{invite.role} • {invite.status}</div><h2 className="mt-1 text-xl font-black text-hgnNavy">{invite.email}</h2><p className="mt-1 break-all text-sm text-slate-600">{link}</p></div>
            <div className="flex flex-wrap gap-2"><button onClick={()=>navigator.clipboard.writeText(link)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black text-hgnNavy">Copy link</button><a className="rounded-lg bg-hgnBlue px-3 py-2 text-sm font-black text-white" href={`mailto:${invite.email}?subject=Haida Gwaii News contributor invite&body=${body}`}>Email invite</a></div>
          </div>
        </article>
      })}
      {!invites.length && <div className="hgn-card p-6 text-slate-600">No invitations yet.</div>}
    </div>
  </main>;
}
