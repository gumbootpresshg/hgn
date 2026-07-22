"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Eye, History, Palette, RotateCcw, Save } from "lucide-react"
import { defaultLabels, normalizeThemeConfig, themePresets, type SiteThemeConfig, type ThemePresetId } from "@/lib/site-theme"
import { supabase } from "@/lib/supabase"

const presetNames: Record<ThemePresetId, string> = {
  "island-newspaper": "Island Newspaper",
  "coastal-modern": "Coastal Modern",
  "weekend-edition": "Weekend Edition",
  "high-contrast": "High Contrast",
}

function rowToTheme(row: any): SiteThemeConfig {
  return normalizeThemeConfig({ preset: row.preset, accent: row.accent, secondary: row.secondary, paper: row.paper, paperMuted: row.paper_muted, ink: row.ink, muted: row.muted, rule: row.rule, headlineFont: row.headline_font, bodyFont: row.body_font, density: row.density, mastheadStyle: row.masthead_style, labels: row.labels })
}

export default function ThemeStudioPage() {
  const [theme, setTheme] = useState<SiteThemeConfig>(themePresets["island-newspaper"])
  const [history, setHistory] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  async function authHeaders() {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function load() {
    const headers = await authHeaders()
    const res = await fetch("/api/theme-studio", { cache: "no-store", headers })
    const data = await res.json()
    if (!res.ok) return setMessage(data.error || "Could not load Theme Studio")
    setTheme(rowToTheme(data.settings))
    setHistory(data.history || [])
  }
  useEffect(() => { void load() }, [])

  function choosePreset(id: ThemePresetId) {
    setTheme({ ...themePresets[id], labels: { ...theme.labels } })
    setMessage(`${presetNames[id]} loaded as a draft.`)
  }

  async function save(publish: boolean) {
    setBusy(true); setMessage("")
    const auth = await authHeaders()
    const res = await fetch("/api/theme-studio", { method: "POST", headers: { "content-type": "application/json", ...auth }, body: JSON.stringify({ theme, publish }) })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) return setMessage(data.error || "Could not save theme")
    setMessage(publish ? "Theme published across the website and app configuration." : "Theme draft saved.")
    if (publish) await load()
  }

  const previewStyle = useMemo(() => ({ background: theme.paper, color: theme.ink, borderColor: theme.rule } as React.CSSProperties), [theme])

  return <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
    <section className="border bg-white p-6">
      <p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">Platform</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">Theme Studio</h1>
      <p className="mt-3 max-w-3xl text-slate-600">Choose a tested theme, adjust safe design controls, edit public labels, preview the result, then publish it without touching code.</p>
      {message ? <p className="mt-4 border-l-4 border-hgnBlue bg-blue-50 px-4 py-3 text-sm font-semibold">{message}</p> : null}
    </section>

    <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6">
        <article className="border bg-white p-5">
          <div className="flex items-center gap-2"><Palette size={19}/><h2 className="font-serif text-2xl font-bold">Theme library</h2></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(themePresets) as ThemePresetId[]).map(id => <button key={id} type="button" onClick={() => choosePreset(id)} className={`border p-4 text-left ${theme.preset === id ? "border-2 border-slate-950" : "border-stone-300"}`}>
              <div className="flex gap-2"><span className="h-5 w-5 rounded-full border" style={{background: themePresets[id].accent}}/><span className="h-5 w-5 rounded-full border" style={{background: themePresets[id].secondary}}/></div>
              <strong className="mt-3 block">{presetNames[id]}</strong>
              <span className="mt-1 block text-sm text-slate-600">{id === "island-newspaper" ? "Traditional HGN newsroom" : id === "coastal-modern" ? "Clean, digital and tourism friendly" : id === "weekend-edition" ? "Warm, visual and magazine-like" : "Maximum clarity and accessibility"}</span>
            </button>)}
          </div>
        </article>

        <article className="border bg-white p-5">
          <h2 className="font-serif text-2xl font-bold">Colours and type</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[["Accent","accent"],["Secondary","secondary"],["Paper","paper"],["Muted paper","paperMuted"],["Ink","ink"],["Rules","rule"]].map(([label,key]) => <label key={key}>{label}<input type="color" value={(theme as any)[key]} onChange={e=>setTheme({...theme,[key]:e.target.value})}/></label>)}
            <label>Headline style<select value={theme.headlineFont} onChange={e=>setTheme({...theme,headlineFont:e.target.value as any})}><option value="serif">Editorial serif</option><option value="classic">Classic newspaper</option><option value="modern">Modern sans</option></select></label>
            <label>Body style<select value={theme.bodyFont} onChange={e=>setTheme({...theme,bodyFont:e.target.value as any})}><option value="sans">Clean sans serif</option><option value="serif">Reading serif</option></select></label>
            <label>Spacing<select value={theme.density} onChange={e=>setTheme({...theme,density:e.target.value as any})}><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option></select></label>
            <label>Masthead<select value={theme.mastheadStyle} onChange={e=>setTheme({...theme,mastheadStyle:e.target.value as any})}><option value="full">Full newspaper masthead</option><option value="compact">Compact digital masthead</option></select></label>
          </div>
        </article>

        <article className="border bg-white p-5">
          <h2 className="font-serif text-2xl font-bold">Site labels</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Object.entries(theme.labels).map(([key,value]) => <label key={key}>{key.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())}<input value={value} onChange={e=>setTheme({...theme,labels:{...theme.labels,[key]:e.target.value}})}/></label>)}
          </div>
        </article>
      </div>

      <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
        <article className="border p-5" style={previewStyle}>
          <div className="flex items-center justify-between border-b pb-3" style={{borderColor:theme.rule}}><span className="text-xs font-bold uppercase tracking-widest">Live preview</span><Eye size={18}/></div>
          <header className={`py-7 text-center ${theme.mastheadStyle === "compact" ? "py-4" : ""}`}>
            <div className="text-4xl font-bold" style={{fontFamily:theme.headlineFont === "modern" ? "Arial, sans-serif" : "Georgia, serif"}}>{theme.labels.siteName}</div>
            <div className="mt-2 text-xs uppercase tracking-[.25em]" style={{color:theme.muted}}>{theme.labels.tagline}</div>
          </header>
          <nav className="flex flex-wrap justify-center gap-4 border-y py-3 text-sm font-bold" style={{borderColor:theme.ink}}>{[theme.labels.news,theme.labels.opinion,theme.labels.weather,theme.labels.community,theme.labels.marketplace,theme.labels.guide].map(x=><span key={x}>{x}</span>)}</nav>
          <div className="grid gap-5 py-6 sm:grid-cols-[1.35fr_.65fr]">
            <div><p className="text-xs font-black uppercase tracking-widest" style={{color:theme.secondary}}>Top story</p><h2 className="mt-2 text-3xl font-bold leading-tight" style={{fontFamily:theme.headlineFont === "modern" ? "Arial, sans-serif" : "Georgia, serif"}}>A clear, flexible front page that still feels unmistakably HGN</h2><p className="mt-3 leading-7" style={{fontFamily:theme.bodyFont === "serif" ? "Georgia, serif" : "Arial, sans-serif",color:theme.muted}}>Editors can change the look and public wording without changing routes, stories or the newsroom workflow.</p><button className="mt-4 px-4 py-2 text-sm font-bold text-white" style={{background:theme.accent}}>Read the story</button></div>
            <aside className="border-l pl-5" style={{borderColor:theme.rule}}><p className="text-xs font-black uppercase tracking-widest" style={{color:theme.secondary}}>{theme.labels.events}</p><p className="mt-3 font-bold">Tourist season guide updates</p><p className="mt-2 text-sm" style={{color:theme.muted}}>Map markers, ferry information and island events remain easy to find.</p></aside>
          </div>
        </article>

        <div className="flex flex-wrap gap-3">
          <button disabled={busy} onClick={()=>save(false)} className="inline-flex items-center gap-2 border px-4 py-3 font-bold"><Save size={17}/>Save draft</button>
          <button disabled={busy} onClick={()=>save(true)} className="inline-flex items-center gap-2 bg-slate-950 px-4 py-3 font-bold text-white"><Check size={17}/>Publish theme</button>
          <button onClick={()=>setTheme({...themePresets["island-newspaper"],labels:defaultLabels})} className="inline-flex items-center gap-2 border px-4 py-3 font-bold"><RotateCcw size={17}/>Reset</button>
        </div>

        <article className="border bg-white p-5"><div className="flex items-center gap-2"><History size={18}/><h2 className="font-serif text-2xl font-bold">Recent published versions</h2></div><div className="mt-4 space-y-3">{history.length ? history.map(item=><button key={item.id} onClick={()=>setTheme(normalizeThemeConfig(item.config))} className="block w-full border p-3 text-left"><strong>{presetNames[item.preset as ThemePresetId] || item.preset}</strong><span className="mt-1 block text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</span></button>) : <p className="text-sm text-slate-500">Published versions will appear here.</p>}</div></article>
      </div>
    </section>
  </main>
}
