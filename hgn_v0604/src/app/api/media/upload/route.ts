import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

function slugPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "image";
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase server credentials" }, { status: 500 });
  }
  const baseUrl = url.replace(/\/$/, "");

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    return NextResponse.json({ error: "Login required to upload media" }, { status: 401 });
  }

  // Verify the access token directly with Supabase Auth. Using a raw request here
  // avoids supabase-js attempting to parse newer publishable project keys or the
  // bearer token as a compact JWS before the request reaches GoTrue.
  let authResponse: Response;
  try {
    authResponse = await fetch(`${baseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Unable to verify the upload session. Please try again." }, { status: 503 });
  }

  const authPayload = await authResponse.json().catch(() => null);
  if (!authResponse.ok || !authPayload?.id) {
    const authMessage = typeof authPayload?.msg === "string"
      ? authPayload.msg
      : typeof authPayload?.message === "string"
        ? authPayload.message
        : "Invalid upload session";
    return NextResponse.json({ error: authMessage }, { status: 401 });
  }

  const user = authPayload;

  // Read the same authenticated profile row that the client-side AdminGate uses.
  // This keeps RLS and the live user session in the permission path, instead of
  // trying to infer access from a separate service-role lookup.
  const profileParams = new URLSearchParams({
    select: "account_type,is_admin,can_access_publisher_tools,admin_role",
    user_id: `eq.${user.id}`,
    limit: "5",
  });

  let profileResponse: Response;
  try {
    profileResponse = await fetch(`${baseUrl}/rest/v1/hgn_profiles?${profileParams.toString()}`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Unable to verify newsroom permissions. Please try again." }, { status: 503 });
  }

  const profileRows = await profileResponse.json().catch(() => []);
  const normalized = (value: unknown) => typeof value === "string" ? value.trim().toLowerCase() : "";
  const allowedRoles = new Set(["admin", "administrator", "publisher", "editor", "newsroom", "super_admin", "superadmin"]);
  const canUpload = profileResponse.ok && Array.isArray(profileRows) && profileRows.some((row: Record<string, unknown>) =>
    row?.is_admin === true ||
    row?.can_access_publisher_tools === true ||
    allowedRoles.has(normalized(row?.account_type)) ||
    allowedRoles.has(normalized(row?.admin_role))
  );

  if (!canUpload) {
    const detail = profileResponse.ok
      ? "Your account is signed in but its HGN profile does not currently contain administrator or publisher permission."
      : "HGN could not read your signed-in profile permissions.";
    return NextResponse.json({ error: detail }, { status: 403 });
  }

  // Support both legacy JWT service-role keys and newer sb_secret_ keys.
  // New Supabase secret keys are API keys, not compact JWS tokens, so they
  // must not be passed as a Bearer token.
  // Supabase Storage and PostgREST require both apikey and Authorization.
  // New sb_secret_ keys are opaque credentials rather than compact JWTs, but
  // they are still supplied as the bearer credential at the HTTP gateway.
  const serviceHeaders: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  const form = await req.formData();
  const file = form.get("file");
  const caption = String(form.get("caption") || "").trim().slice(0, 500);
  const credit = String(form.get("credit") || "").trim().slice(0, 200);
  const alt_text = String(form.get("alt_text") || "").trim().slice(0, 300);
  const usage_type = slugPart(String(form.get("usage_type") || "article")).slice(0, 60);
  const requestedBucket = String(form.get("bucket") || "article-images");
  const allowedBuckets = new Set(["article-images", "hgn-media"]);
  const bucket = allowedBuckets.has(requestedBucket) ? requestedBucket : "article-images";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]);
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Use a JPEG, PNG, WebP, AVIF, HEIC, or HEIF image." }, { status: 400 });
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

  async function uploadObject(path: string, body: Buffer) {
    const response = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: {
        ...serviceHeaders,
        "Content-Type": "image/webp",
        "x-upsert": "true",
      },
      body: new Uint8Array(body),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.message || payload?.error || `Storage upload failed (${response.status})`;
      throw new Error(message);
    }
  }

  try {
    await uploadObject(webPath, webBuffer);
    await uploadObject(thumbPath, thumbBuffer);
  } catch (uploadError) {
    return NextResponse.json({
      error: uploadError instanceof Error ? uploadError.message : "Storage upload failed",
    }, { status: 500 });
  }

  const publicBase = `${baseUrl}/storage/v1/object/public/${bucket}`;
  const webUrl = `${publicBase}/${webPath}`;
  const thumbUrl = `${publicBase}/${thumbPath}`;

  const assetPayload = {
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
  };

  const insertResponse = await fetch(`${baseUrl}/rest/v1/media_assets?select=*`, {
    method: "POST",
    headers: {
      ...serviceHeaders,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(assetPayload),
    cache: "no-store",
  });
  const insertedRows = await insertResponse.json().catch(() => null);
  if (!insertResponse.ok) {
    const message = insertedRows?.message || insertedRows?.error || `Media record save failed (${insertResponse.status})`;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const asset = Array.isArray(insertedRows) ? insertedRows[0] : insertedRows;
  return NextResponse.json({ asset });
}
