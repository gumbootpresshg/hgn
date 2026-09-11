import { supabase } from "@/lib/supabase";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const MEDIA_EXTENSIONS = [...IMAGE_EXTENSIONS, "mp4", "mov", "m4v", "webm", "pdf"];

function safeExtension(file: File, allowed: string[]) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return allowed.includes(extension) ? extension : allowed[0];
}

function assertUpload(file: File | null, options: { imagesOnly?: boolean; maxMb?: number }) {
  if (!file || file.size === 0) return false;

  if (options.imagesOnly && !file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const maxBytes = (options.maxMb || 25) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File is too large. Please use a file under ${options.maxMb || 25}MB.`);
  }

  return true;
}

export async function uploadPublicImage(file: File | null, folder = "uploads") {
  if (!assertUpload(file, { imagesOnly: true, maxMb: 10 })) return "";

  const extension = safeExtension(file as File, IMAGE_EXTENSIONS);
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("hgn-media").upload(path, file as File, {
    cacheControl: "31536000",
    upsert: false,
    contentType: (file as File).type,
  });

  if (error) throw error;
  const { data } = supabase.storage.from("hgn-media").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPublicMedia(file: File | null, folder = "uploads") {
  if (!assertUpload(file, { imagesOnly: false, maxMb: 50 })) return "";

  const extension = safeExtension(file as File, MEDIA_EXTENSIONS);
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("hgn-media").upload(path, file as File, {
    cacheControl: "31536000",
    upsert: false,
    contentType: (file as File).type,
  });

  if (error) throw error;
  const { data } = supabase.storage.from("hgn-media").getPublicUrl(path);
  return data.publicUrl;
}
