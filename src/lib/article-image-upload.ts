import { supabase } from "@/lib/supabase"

export async function uploadArticleImage(file: File, articleId: string) {
  if (!file || file.size === 0) {
    throw new Error("Choose an image first.")
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.")
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error("Image is too large. Please use an image under 10MB.")
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const safeExtension = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
    ? extension
    : "jpg"

  const path = `articles/${articleId}/${crypto.randomUUID()}.${safeExtension}`

  const { error } = await supabase.storage
    .from("hgn-media")
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from("hgn-media").getPublicUrl(path)

  return data.publicUrl
}
