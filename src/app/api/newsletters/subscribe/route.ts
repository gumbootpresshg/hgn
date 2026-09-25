import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/newsletters/server";
import { sendWelcomeEmail } from "@/lib/newsletters/welcome";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

    const db = serviceClient();
    const { data: products, error: productsError } = await db
      .from("hgn_newsletter_products")
      .select("slug,featured")
      .eq("status", "active")
      .eq("show_on_public_signup", true)
      .eq("accept_new_subscribers", true)
      .order("sort_order");
    if (productsError) return NextResponse.json({ error: "Newsletter products are not ready. Confirm the v291 migration has been run." }, { status: 503 });

    const available = products || [];
    const allowed = new Set(available.map((product: any) => product.slug));
    let selected = Array.isArray(body.products) ? body.products.map(String).filter((slug: string) => allowed.has(slug)).slice(0, 20) : [];
    if (available.length === 1) selected = [available[0].slug];
    if (!selected.length && available.length) {
      const featured = available.find((product: any) => product.featured);
      selected = [(featured || available[0]).slug];
    }
    if (!selected.length) return NextResponse.json({ error: "Newsletter signup is not available right now." }, { status: 400 });

    const { data: existing, error: existingError } = await db
      .from("subscribers")
      .select("id,status,newsletter_product_slugs")
      .ilike("email", email)
      .maybeSingle();
    if (existingError) return NextResponse.json({ error: "The newsletter subscriber list could not be read." }, { status: 500 });

    // Keep historical/paused product preferences, including Haida Gwaii Guide,
    // while replacing the public choices with the currently eligible selection.
    const preservedUnavailable = (existing?.newsletter_product_slugs || []).filter((slug: string) => !allowed.has(slug));
    selected = [...new Set([...selected, ...preservedUnavailable])];
    const isNew = !existing?.id || existing.status !== "active";
    const row = {
      email,
      name: String(body.name || "").trim() || null,
      source: "newsletter_page",
      status: "active",
      frequency: "biweekly",
      consent_source: "newsletter_page",
      newsletter_product_slugs: selected,
      unsubscribed_at: null,
      updated_at: new Date().toISOString(),
    };
    const result = existing?.id
      ? await db.from("subscribers").update(row).eq("id", existing.id).select("id,email,name,status,newsletter_product_slugs,preference_token").single()
      : await db.from("subscribers").insert(row).select("id,email,name,status,newsletter_product_slugs,preference_token").single();
    if (result.error || !result.data) return NextResponse.json({ error: result.error?.message || "The signup could not be saved." }, { status: 500 });

    const welcome = isNew ? await sendWelcomeEmail(db, result.data) : { sent: false, reason: "Your subscription preferences were updated." };
    return NextResponse.json({ ok: true, welcome });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Newsletter signup is temporarily unavailable." }, { status: 500 });
  }
}
