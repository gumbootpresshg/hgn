type ArticleImageProps = {
  src?: string | null
  alt?: string | null
  caption?: string | null
  credit?: string | null
}

export default function ArticleImage({ src, alt, caption, credit }: ArticleImageProps) {
  if (!src) return null

  return (
    <figure className="my-6 overflow-hidden rounded-3xl border bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt || "Article image"} className="w-full object-cover" />
      {(caption || credit) ? (
        <figcaption className="space-y-1 px-4 py-3 text-sm text-slate-500">
          {caption ? <p>{caption}</p> : null}
          {credit ? <p className="text-xs uppercase tracking-wide">Photo: {credit}</p> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}
