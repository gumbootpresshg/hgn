import { supabase } from "@/lib/supabase";

// Notifies IndexNow about one article that was just published or updated.
// The API submits only that URL, and only after the public page returns 200.
export async function notifyIndexNow(path: string) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token || !path) return;
    await fetch("/api/distribution/indexnow", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: path }),
    });
  } catch {
    // Publishing should succeed even if IndexNow is temporarily unreachable.
  }
}
