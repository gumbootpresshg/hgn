import { supabase } from "@/lib/supabase"

export async function uploadAdImage(file: File, adId: string) {
  if (!file || file.size === 0) {
    throw new Error("Choose an ad image first.")
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.")
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error("Ad image is too large. Use an image under 10MB.")
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const safeExtension = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
    ? extension
    : "jpg"

  const path = `ads/${adId}/${crypto.randomUUID()}.${safeExtension}`

  const { error } = await supabase.storage
    .from("hgn-ads")
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    })

  if (error) throw error

  const { data } = supabase.storage.from("hgn-ads").getPublicUrl(path)
  return { publicUrl: data.publicUrl, path, size: file.size }
}
