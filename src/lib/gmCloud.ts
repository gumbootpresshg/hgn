import { supabase } from "@/lib/supabase";

export type GmSaveKind = "mock_draft" | "draft_board" | "my_prospects" | "scouting_clipboard";

export async function getSignedInUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) return sessionData.session.user;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function loadLatestGmSave<T>(kind: GmSaveKind) {
  const user = await getSignedInUser();
  if (!user) {
    return {
      user: null,
      data: null as T | null,
      error: "Sign in on the Account page first, then come back and click Load account.",
    };
  }

  const { data, error } = await supabase
    .from("gm_tool_saves")
    .select("payload, updated_at")
    .eq("user_id", user.id)
    .eq("kind", kind)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      user,
      data: null as T | null,
      error: `Could not load account save: ${error.message}. Run supabase/admin_login_save_fix.sql if you have not yet.`,
    };
  }

  return { user, data: (data?.payload as T | undefined) ?? null, error: null as string | null };
}

export async function saveGmTool(kind: GmSaveKind, payload: unknown, title = "Default") {
  const user = await getSignedInUser();
  if (!user) {
    return { ok: false, error: "Sign in on the Account page to save this to your PuckScope account." };
  }

  const now = new Date().toISOString();

  const { data: existing, error: findError } = await supabase
    .from("gm_tool_saves")
    .select("id")
    .eq("user_id", user.id)
    .eq("kind", kind)
    .eq("title", title)
    .maybeSingle();

  if (findError) {
    return {
      ok: false,
      error: `Could not check existing save: ${findError.message}. Run supabase/admin_login_save_fix.sql in Supabase.`,
    };
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("gm_tool_saves")
      .update({ payload, updated_at: now })
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) return { ok: false, error: `Could not update account save: ${error.message}` };
    return { ok: true, error: null as string | null };
  }

  const { error } = await supabase.from("gm_tool_saves").insert({
    user_id: user.id,
    kind,
    title,
    payload,
    created_at: now,
    updated_at: now,
  });

  if (error) return { ok: false, error: `Could not create account save: ${error.message}` };
  return { ok: true, error: null as string | null };
}
