"use client"

import { useEffect, useMemo, useState } from "react"
import GamesPlayer from "@/components/GamesPlayer"
import { cleanAnswer, crossword, sudoku, wordSearch, type GameType } from "@/lib/games"
import { supabase } from "@/lib/supabase"

type Game = { id: string; game_type: GameType; title: string; difficulty: string; instructions?: string | null; payload: any; published: boolean; published_at?: string | null; created_at?: string }
const defaultInstructions: Record<GameType, string> = {
  crossword: "Fill in the answers using the clues below.",
  wordsearch: "Find every hidden word in the grid.",
  sudoku: "Fill each row, column and 3×3 box with the numbers 1 to 9.",
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [type, setType] = useState<GameType>("crossword")
  const [title, setTitle] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [instructions, setInstructions] = useState(defaultInstructions.crossword)
  const [source, setSource] = useState("")
  const [preview, setPreview] = useState<Game | null>(null)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data, error } = await supabase.from("hgn_games").select("*").order("created_at", { ascending: false })
    if (error) setMessage(error.message)
    else setGames((data || []) as Game[])
  }
  useEffect(() => { void load() }, [])

  const example = useMemo(() => type === "crossword" ? "HAIDA | Indigenous people of Haida Gwaii\nMasset | North-end village" : "HAIDA\nGWAII\nMASSET\nSKIDEGATE", [type])
  function buildPayload() {
    if (type === "sudoku") return sudoku(difficulty)
    if (type === "wordsearch") {
      const words = source.split(/[\n,]+/).map(cleanAnswer).filter(Boolean)
      if (words.length < 3) throw new Error("Add at least three words, one per line.")
      const payload = wordSearch(words)
      if (payload.words.length !== words.length) throw new Error("One or more words will not fit. Shorten a word or remove it, then try again.")
      return payload
    }
    const entries = source.split("\n").map((line) => {
      const [answer, ...clue] = line.split("|")
      return { answer: answer || "", clue: clue.join("|") || "" }
    }).filter((entry) => cleanAnswer(entry.answer) && entry.clue.trim())
    if (entries.length < 2) throw new Error("Add at least two entries as ANSWER | clue.")
    const payload = crossword(entries)
    if (payload.entries.length !== entries.length) throw new Error("Some entries could not fit together. Try fewer entries, shorter answers, or different answers.")
    return payload
  }
  function makePreview() {
    try {
      const payload = buildPayload()
      setPreview({ id: "preview", game_type: type, title: title.trim() || `${type === "wordsearch" ? "Word Search" : type === "sudoku" ? "Sudoku" : "Crossword"} preview`, difficulty, instructions: instructions.trim() || defaultInstructions[type], payload, published: false })
      setMessage(type === "sudoku" ? "Fresh Sudoku generated. Click Generate again for another unique puzzle." : "Preview generated. Check it, then publish when ready.")
    } catch (error: any) { setMessage(error.message || "Could not generate this puzzle.") }
  }
  async function publish() {
    try {
      setSaving(true); setMessage("")
      const payload = preview?.game_type === type ? preview.payload : buildPayload()
      const finalTitle = title.trim() || `${type === "wordsearch" ? "Word Search" : type === "sudoku" ? "Sudoku" : "Crossword"} — ${new Date().toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}`
      const { error } = await supabase.from("hgn_games").insert({ game_type: type, title: finalTitle, difficulty, instructions: instructions.trim() || defaultInstructions[type], payload, published: true, published_at: new Date().toISOString() })
      if (error) throw error
      setMessage("Published — it is now live on the Games page.")
      setTitle(""); setSource(""); setPreview(null); await load()
    } catch (error: any) { setMessage(error.message || "Could not publish this game.") }
    finally { setSaving(false) }
  }
  async function setPublished(game: Game, published: boolean) {
    const { error } = await supabase.from("hgn_games").update({ published, published_at: published ? new Date().toISOString() : game.published_at }).eq("id", game.id)
    setMessage(error ? error.message : published ? "Game published." : "Game removed from the public Games page.")
    if (!error) await load()
  }
  async function remove(game: Game) {
    if (!window.confirm(`Delete “${game.title}”? This cannot be undone.`)) return
    const { error } = await supabase.from("hgn_games").delete().eq("id", game.id)
    setMessage(error ? error.message : "Game deleted.")
    if (!error) await load()
  }
  function chooseType(next: GameType) { setType(next); setInstructions(defaultInstructions[next]); setSource(""); setPreview(null); setMessage("") }

  return <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
    <section className="rounded-3xl bg-[#071f35] p-7 text-[#f4eee3] shadow-sm"><p className="newspaper-kicker text-red-300">Publisher CMS</p><h1 className="mt-2 font-serif text-5xl font-bold">Games</h1><p className="mt-3 max-w-3xl text-stone-200">Build a crossword or word search from your own list, or make a brand-new Sudoku. Every published game becomes its own edition on the public Games page.</p></section>
    <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
      <div className="grid gap-4 md:grid-cols-3"><label className="grid gap-1 text-sm font-bold">Game type<select value={type} onChange={(event) => chooseType(event.target.value as GameType)} className="rounded-xl border px-3 py-2.5"><option value="crossword">Crossword</option><option value="wordsearch">Word search</option><option value="sudoku">Sudoku</option></select></label><label className="grid gap-1 text-sm font-bold">Difficulty<select value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setPreview(null) }} className="rounded-xl border px-3 py-2.5"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label className="grid gap-1 text-sm font-bold">Title <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. October 10 Crossword" className="rounded-xl border px-3 py-2.5" /></label></div>
      <label className="mt-4 grid gap-1 text-sm font-bold">Instructions <input value={instructions} onChange={(event) => setInstructions(event.target.value)} className="rounded-xl border px-3 py-2.5" /></label>
      {type !== "sudoku" ? <label className="mt-4 grid gap-1 text-sm font-bold">{type === "crossword" ? "Answers and clues" : "Words to find"}<textarea value={source} onChange={(event) => { setSource(event.target.value); setPreview(null) }} rows={8} placeholder={example} className="rounded-xl border px-3 py-2.5 font-mono text-sm" /><span className="font-normal text-slate-500">{type === "crossword" ? "One per line: ANSWER | clue. Letters and spaces are fine; punctuation is removed." : "One word or phrase per line. Spaces and punctuation are removed in the grid."}</span></label> : <div className="mt-5 rounded-2xl bg-stone-100 p-4 text-sm leading-6 text-stone-700">Choose the difficulty, then click <b>Generate preview</b>. It creates a fresh Sudoku solution and a new set of clues every time, so a new edition will not reuse the last puzzle.</div>}
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={makePreview} className="rounded-full border border-hgnBlue px-5 py-3 text-sm font-bold text-hgnBlue">Generate preview</button><button type="button" onClick={() => void publish()} disabled={saving} className="hgn-btn-primary disabled:opacity-60">{saving ? "Publishing…" : "Publish game"}</button></div>
      {message ? <p className="mt-4 rounded-2xl bg-stone-100 p-4 text-sm font-medium">{message}</p> : null}
    </section>
    {preview ? <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7"><p className="newspaper-kicker text-hgnRed">Preview</p><div className="mt-4"><GamesPlayer games={[preview] as any[]} /></div></section> : null}
    <section><div className="mb-3 flex items-end justify-between gap-3"><div><p className="newspaper-kicker text-hgnRed">Library</p><h2 className="mt-1 font-serif text-4xl font-bold">Published and saved editions</h2></div><a href="/games" target="_blank" className="text-sm font-bold text-hgnBlue underline">Open public Games page</a></div><div className="grid gap-4 md:grid-cols-2">{games.map((game) => <article key={game.id} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[.16em] text-hgnBlue">{game.game_type} · {game.difficulty} · {game.published ? "Live" : "Hidden"}</p><h3 className="mt-2 text-xl font-black">{game.title}</h3><p className="mt-2 text-sm text-slate-600">{game.published_at ? `Published ${new Date(game.published_at).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}` : "Not published"}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void setPublished(game, !game.published)} className="rounded-full border px-3 py-2 text-xs font-bold">{game.published ? "Hide from public" : "Publish"}</button><button onClick={() => void remove(game)} className="rounded-full bg-red-700 px-3 py-2 text-xs font-bold text-white">Delete</button></div></article>)}{!games.length ? <p className="rounded-2xl border border-dashed p-6 text-sm text-slate-600">No games saved yet. Create your first one above.</p> : null}</div></section>
  </main>
}
