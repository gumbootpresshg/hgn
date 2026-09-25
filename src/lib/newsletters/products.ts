import { serviceClient } from "@/lib/newsletters/server";

export const PRODUCT_FIELDS = "id,name,slug,description,frequency,status,show_on_public_signup,show_in_account_preferences,accept_new_subscribers,allow_sending,show_public_archive,featured,sender_name,reply_to_email,sort_order";

export async function publicNewsletterSignupConfig() {
  const db = serviceClient();
  const [{ data: page }, { data: products }] = await Promise.all([
    db.from("hgn_newsletter_signup_page").select("*").eq("singleton_key", "default").maybeSingle(),
    db.from("hgn_newsletter_products").select(PRODUCT_FIELDS).eq("status", "active").eq("show_on_public_signup", true).eq("accept_new_subscribers", true).order("sort_order"),
  ]);
  return { page, products: products || [] };
}
