import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export const runtime = "nodejs";

function slugPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "image";
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase server credentials" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return NextResponse.json({ error: "Login required to upload media" }, { status: 401 });
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Invalid upload session" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("hgn_profiles")
    .select("account_type,is_admin,can_access_publisher_tools")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  const canUpload = Boolean(profile?.is_admin || profile?.can_access_publisher_tools || profile?.account_type === "admin");
  if (!canUpload) {
    return NextResponse.json({ error: "Publisher access required to upload media" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const caption = String(form.get("caption") || "");
  const credit = String(form.get("credit") || "");
  const alt_text = String(form.get("alt_text") || "");
  const usage_type = String(form.get("usage_type") || "article");
  const requestedBucket = String(form.get("bucket") || "article-images");
  const allowedBuckets = new Set(["article-images", "hgn-media"]);
  const bucket = allowedBuckets.has(requestedBucket) ? requestedBucket : "article-images";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  const maxBytes = 12 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Image is too large. Please use a file under 12MB." }, { status: 400 });
  }

  const originalName = file.name || "upload.jpg";
  const arrayBuffer = await file.arrayBuffer();
  const input = Buffer.from(arrayBuffer);
  const base = `${Date.now()}-${slugPart(originalName.replace(/\.[^.]+$/, ""))}`;

  const webBuffer = await sharp(input)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const thumbBuffer = await sharp(input)
    .rotate()
    .resize({ width: 500, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toBuffer();

  const meta = await sharp(webBuffer).metadata();
  const webPath = `${usage_type}/${base}-web.webp`;
  const thumbPath = `${usage_type}/${base}-thumb.webp`;

  const webUpload = await supabase.storage.from(bucket).upload(webPath, webBuffer, {
    contentType: "image/webp",
    upsert: true,
  });
  if (webUpload.error) return NextResponse.json({ error: webUpload.error.message }, { status: 500 });

  const thumbUpload = await supabase.storage.from(bucket).upload(thumbPath, thumbBuffer, {
    contentType: "image/webp",
    upsert: true,
  });
  if (thumbUpload.error) return NextResponse.json({ error: thumbUpload.error.message }, { status: 500 });

  const webUrl = supabase.storage.from(bucket).getPublicUrl(webPath).data.publicUrl;
  const thumbUrl = supabase.storage.from(bucket).getPublicUrl(thumbPath).data.publicUrl;

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      bucket,
      original_filename: originalName,
      storage_path: webPath,
      public_url: webUrl,
      web_url: webUrl,
      thumbnail_url: thumbUrl,
      mime_type: "image/webp",
      size_bytes: webBuffer.length,
      width: meta.width || null,
      height: meta.height || null,
      caption,
      credit,
      alt_text,
      usage_type,
      status: "active",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ asset: data });
}
