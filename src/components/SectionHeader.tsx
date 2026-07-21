export function SectionHeader({ title, eyebrow, description }: { title: string; eyebrow?: string; description?: string }) {
  return (
    <header className="mb-8 border-b-4 border-double border-stone-900 pb-5">
      {eyebrow && <p className="newspaper-kicker">{eyebrow}</p>}
      <h1 className="mt-1 font-serif text-4xl font-bold leading-[1.02] tracking-tight text-stone-950 md:text-6xl">{title}</h1>
      {description && <p className="mt-3 max-w-3xl text-base leading-7 text-stone-600 md:text-lg">{description}</p>}
    </header>
  )
}
