"use client"

import { useState } from "react"

type Game = { id: string; game_type: string; title: string; difficulty: string; instructions?: string | null; payload: any; published_at?: string | null }

export default function GamesPlayer({ games }: { games: Game[] }) {
  const [active, setActive] = useState(games[0]?.id || "")
  const game = games.find((item) => item.id === active)
  return <>
    {games.length > 1 ? <div className="mb-6 flex flex-wrap gap-2">{games.map((item) => <button key={item.id} onClick={() => setActive(item.id)} className={`border px-3 py-2 text-sm font-bold ${active === item.id ? "border-hgnRed bg-hgnRed text-white" : "border-stone-300 bg-white"}`}>{item.title}</button>)}</div> : null}
    {game ? <GameBoard key={game.id} game={game} /> : <div className="border border-dashed border-stone-300 bg-stone-50 p-8">New games are coming soon.</div>}
  </>
}

function GameBoard({ game }: { game: Game }) {
  const [done, setDone] = useState<string[]>([])
  const [pick, setPick] = useState<number[]>([])
  const [values, setValues] = useState<string[]>(() => game.game_type === "sudoku" ? game.payload.puzzle.map((value: number) => value ? String(value) : "") : game.game_type === "crossword" ? game.payload.grid.flat().map((value: string) => value === "#" ? "#" : "") : [])
  const p = game.payload
  const complete = game.game_type === "sudoku" ? values.every((value, index) => Number(value) === p.solution[index]) : game.game_type === "crossword" ? values.every((value, index) => p.grid.flat()[index] === "#" || value === p.grid.flat()[index]) : false
  if (game.game_type === "wordsearch") return <WordSearch game={game} done={done} pick={pick} setDone={setDone} setPick={setPick} />
  return <section>
    <GameHead game={game} />
    {game.game_type === "crossword" ? <div className="grid max-w-2xl grid-cols-[repeat(17,minmax(0,1fr))] border border-stone-400">
      {p.grid.flat().map((letter: string, index: number) => letter === "#" ? <div key={index} className="aspect-square bg-stone-900" /> : <input key={index} maxLength={1} value={values[index] || ""} onChange={(event) => setValues((items) => items.map((value, itemIndex) => itemIndex === index ? event.target.value.toUpperCase().replace(/[^A-Z]/g, "") : value))} className="aspect-square min-w-0 border-r border-b border-stone-300 text-center text-[10px] font-bold uppercase sm:text-base" />)}
    </div> : <div className="grid max-w-xl grid-cols-9 border border-stone-500">
      {values.map((value, index) => { const fixed = Boolean(p.puzzle[index]); return <input key={index} maxLength={1} disabled={fixed} value={value} onChange={(event) => setValues((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value.replace(/[^1-9]/g, "") : item))} className={`aspect-square min-w-0 border-r border-b border-stone-300 text-center font-bold ${fixed ? "bg-stone-100 text-stone-700" : "bg-white"}`} /> })}
    </div>}
    <button onClick={() => alert(complete ? "Correct — puzzle completed!" : "Not quite yet. Keep going!")} className="mt-5 hgn-btn-primary">Check puzzle</button>
    {game.game_type === "crossword" ? <div className="mt-7 grid gap-5 sm:grid-cols-2"><div><h3 className="font-serif text-2xl font-bold">Across</h3>{p.entries.filter((entry: any) => entry.dc === 1).map((entry: any) => <p key={entry.number} className="mt-2 text-sm"><b>{entry.number}.</b> {entry.clue}</p>)}</div><div><h3 className="font-serif text-2xl font-bold">Down</h3>{p.entries.filter((entry: any) => entry.dr === 1).map((entry: any) => <p key={entry.number} className="mt-2 text-sm"><b>{entry.number}.</b> {entry.clue}</p>)}</div></div> : null}
  </section>
}

function WordSearch({ game, done, pick, setDone, setPick }: { game: Game; done: string[]; pick: number[]; setDone: React.Dispatch<React.SetStateAction<string[]>>; setPick: React.Dispatch<React.SetStateAction<number[]>> }) {
  const p = game.payload
  const size = p.grid.length
  function choose(index: number) {
    const next = pick.length === 1 ? [pick[0], index] : [index]
    if (next.length === 1) return setPick(next)
    const [start, end] = next
    const r1 = Math.floor(start / size), c1 = start % size, r2 = Math.floor(end / size), c2 = end % size
    const found = p.placements.find((entry: any) => (entry.row === r1 && entry.col === c1 && entry.endR === r2 && entry.endC === c2) || (entry.row === r2 && entry.col === c2 && entry.endR === r1 && entry.endC === c1))
    if (found) setDone((items) => [...new Set([...items, found.word])])
    setPick([])
  }
  return <section><GameHead game={game} /><div style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }} className="mx-auto grid max-w-xl border border-stone-400">{p.grid.flat().map((letter: string, index: number) => <button key={index} onClick={() => choose(index)} className={`aspect-square border-r border-b border-stone-200 text-[10px] font-bold sm:text-base ${pick.includes(index) ? "bg-hgnRed text-white" : "bg-white"}`}>{letter}</button>)}</div><p className="mt-5 text-sm leading-7">Find: {p.words.map((word: string) => <span key={word} className={`mr-3 font-bold ${done.includes(word) ? "text-hgnRed line-through" : ""}`}>{word}</span>)}</p>{done.length === p.words.length ? <p className="mt-4 font-bold text-hgnRed">Completed!</p> : null}</section>
}

function GameHead({ game }: { game: Game }) { return <header className="mb-5"><p className="newspaper-kicker text-hgnRed">{game.game_type} · {game.difficulty}</p><h2 className="mt-1 font-serif text-4xl font-bold">{game.title}</h2>{game.instructions ? <p className="mt-2 text-stone-600">{game.instructions}</p> : null}</header> }
