"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data, error } = await supabase
      .from("hgn_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) setMessage(error.message)
    else setMembers(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function createMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setSaving(true)
    setMessage("")

    try {
      const email = String(form.get("email") || "").trim()
      const displayName = String(form.get("display_name") || "").trim()
      const accountType = String(form.get("account_type") || "free_individual")

      if (!email) {
        setMessage("Email is required.")
        return
      }

      const { error } = await supabase
        .from("hgn_profiles")
        .insert({
          email,
          display_name: displayName || email.split("@")[0],
          account_type: accountType,
          newsletter_opt_in: form.get("newsletter_opt_in") === "on",
          member_badge: accountType === "paid_individual",
          verified_plus: accountType === "business_organization" || accountType === "admin",
          is_admin: accountType === "admin",
          can_access_publisher_tools: accountType === "admin",
          admin_role: accountType === "admin" ? "publisher" : null,
        })

      if (error) setMessage(error.message)
      else {
        setMessage("Member added.")
        formElement.reset()
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  async function updateMember(id: string, patch: any) {
    const { error } = await supabase
      .from("hgn_profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) setMessage(error.message)
    else {
      setMessage("Member updated.")
      await load()
    }
  }

  async function deleteMember(id: string) {
    if (!window.confirm("Delete this member profile? This does not delete the Supabase Auth login.")) return
    const { error } = await supabase.from("hgn_profiles").delete().eq("id", id)

    if (error) setMessage(error.message)
    else {
      setMessage("Member profile deleted.")
      await load()
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Members</h1>
        <p className="mt-3 text-slate-600">Add users, verify members, assign account types, badges and delete member profiles.</p>
      </section>

      <form onSubmit={createMember} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">Add Member</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <input name="email" type="email" required placeholder="Email" className="rounded-2xl border px-4 py-3" />
          <input name="display_name" placeholder="Display name" className="rounded-2xl border px-4 py-3" />
          <select name="account_type" className="rounded-2xl border px-4 py-3">
            <option value="free_individual">Free Individual</option>
            <option value="paid_individual">Paid Individual Member</option>
            <option value="business_organization">Business / Organization</option>
            <option value="admin">Admin / Publisher</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" name="newsletter_opt_in" />
          Newsletter opt-in
        </label>
        <button disabled={saving} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
          {saving ? "Adding..." : "Add Member"}
        </button>
      </form>

      {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}

      <section className="grid gap-4">
        {members.length === 0 ? <p className="rounded-2xl border bg-white p-6 text-slate-600">No member profiles found yet.</p> : null}

        {members.map((member) => (
          <article key={member.id} className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">{member.account_type || "free_individual"}</p>
                <h2 className="mt-2 text-xl font-black">{member.display_name || member.email || "Unnamed member"}</h2>
                <p className="mt-1 text-sm text-slate-600">{member.email}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  {member.verified_plus ? <span className="rounded-full bg-hgnBlue px-3 py-1 text-white">Verified Plus</span> : null}
                  {member.member_badge ? <span className="rounded-full bg-slate-950 px-3 py-1 text-white">Member Badge</span> : null}
                  {member.newsletter_opt_in ? <span className="rounded-full bg-slate-100 px-3 py-1">Newsletter</span> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateMember(member.id, { verified_plus: !member.verified_plus })} className="rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide">
                  {member.verified_plus ? "Unverify" : "Verify"}
                </button>
                <button onClick={() => updateMember(member.id, { member_badge: !member.member_badge })} className="rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide">
                  {member.member_badge ? "Remove Badge" : "Add Badge"}
                </button>
                <button onClick={() => updateMember(member.id, { account_type: "paid_individual", member_badge: true })} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                  Paid
                </button>
                <button onClick={() => updateMember(member.id, { account_type: "business_organization", verified_plus: true })} className="rounded-full bg-hgnBlue px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                  Business
                </button>
                <button onClick={() => updateMember(member.id, { account_type: "admin", is_admin: true, can_access_publisher_tools: true, admin_role: "publisher" })} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                  Make Admin
                </button>
                <button onClick={() => updateMember(member.id, { is_admin: false, can_access_publisher_tools: false, admin_role: null, account_type: "free_individual" })} className="rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide">
                  Remove Admin
                </button>
                <button onClick={() => deleteMember(member.id)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
