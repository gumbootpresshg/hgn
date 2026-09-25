import { escapeHtml } from "@/lib/newsletters/server";

export async function sendWelcomeEmail(db:any, subscriber:any) {
  const email = String(subscriber?.email || "").trim().toLowerCase();
  if (!email || !subscriber?.id) return { sent:false, reason:"No subscriber email was available." };
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    await db.from("hgn_newsletter_welcome_sends").insert({subscriber_id:subscriber.id,email,status:"skipped",error_message:"RESEND_API_KEY is not configured."});
    return { sent:false, reason:"Welcome email is not configured yet." };
  }
  const [{data:settings},{data:product}] = await Promise.all([
    db.from("hgn_newsletter_settings").select("from_name,from_email,reply_to").eq("singleton_key","default").maybeSingle(),
    db.from("hgn_newsletter_products").select("name,sender_name,reply_to_email").eq("slug","hgn-news").maybeSingle(),
  ]);
  if (!settings?.from_email) {
    await db.from("hgn_newsletter_welcome_sends").insert({subscriber_id:subscriber.id,email,status:"skipped",error_message:"Newsletter sender settings are incomplete."});
    return { sent:false, reason:"Welcome email sender settings are incomplete." };
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://haidagwaiinews.com";
  const preference = `${site}/newsletter/preferences/${subscriber.preference_token || ""}`;
  const response = await fetch("https://api.resend.com/emails", {method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from:`${product?.sender_name || settings.from_name || "Haida Gwaii News"} <${settings.from_email}>`,to:[email],reply_to:product?.reply_to_email || settings.reply_to || undefined,subject:"Welcome to Haida Gwaii News",html:`<!doctype html><html><body style="margin:0;background:#f4f0e8;color:#10243b;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:620px;max-width:100%;background:#fff;border:1px solid #d8d2c8"><tr><td style="padding:32px"><div style="font:700 34px Georgia,serif">Haida Gwaii News</div><p style="font-size:18px;line-height:1.55">Thanks for signing up${subscriber.name?`, ${escapeHtml(subscriber.name)}`:""}.</p><p style="line-height:1.55">You’ll receive the local updates you selected from Haida Gwaii News. We’ll keep it useful, local and easy to manage.</p><p style="margin:26px 0"><a href="${escapeHtml(preference)}" style="background:#10243b;color:#fff;padding:12px 18px;text-decoration:none;font-weight:bold">Manage newsletter preferences</a></p><p style="font-size:13px;color:#555">You can update your choices or unsubscribe at any time.</p></td></tr></table></td></tr></table></body></html>`})});
  const result = await response.json().catch(()=>null);
  if (!response.ok) { await db.from("hgn_newsletter_welcome_sends").insert({subscriber_id:subscriber.id,email,status:"failed",error_message:result?.message || `Resend ${response.status}`}); return {sent:false,reason:"The signup was saved, but the welcome email could not be sent."}; }
  await db.from("hgn_newsletter_welcome_sends").insert({subscriber_id:subscriber.id,email,status:"accepted",resend_email_id:result?.id||null,sent_at:new Date().toISOString()});
  return {sent:true};
}
