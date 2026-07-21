import { supabase } from "@/lib/supabase"

export async function ensureHgnProfile(user: any) {
  if (!user?.id) return null

  const email = user.email || ""

  const { data: existing } = await supabase
    .from("hgn_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) return existing

  const { data, error } = await supabase
    .from("hgn_profiles")
    .insert({
      user_id: user.id,
      email,
      account_type: "free_individual",
      display_name: email ? email.split("@")[0] : "",
    })
    .select()
    .single()

  if (error) {
    console.warn("Unable to create HGN profile", error.message)
    return null
  }

  return data
}
