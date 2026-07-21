export function SectionHeader({ title, eyebrow, description }: { title: string; eyebrow?: string; description?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="text-sm font-black uppercase tracking-[0.25em] text-hgnBlue">{eyebrow}</p>}
      <h1 className="text-4xl font-black text-hgnNavy md:text-5xl">{title}</h1>
      {description && <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">{description}</p>}
    </div>
  );
}
