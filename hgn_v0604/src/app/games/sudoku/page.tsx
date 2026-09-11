import { SectionHeader } from "@/components/SectionHeader";

const givens: Record<number, number> = {0:5, 4:7, 9:6, 12:1, 13:9, 14:5, 19:9, 20:8, 25:6, 27:8, 31:6, 35:3, 36:4, 39:8, 41:3, 44:1, 45:7, 49:2, 53:6, 55:6, 60:2, 61:8, 66:4, 67:1, 68:9, 71:5, 76:8, 80:9};

export default function Sudoku(){
  return <main className="mx-auto max-w-4xl px-4 py-10"><SectionHeader eyebrow="Games & Puzzles" title="Daily Sudoku" description="A clean Sudoku page for repeat visitors. Future version can generate a fresh puzzle every day and save completion streaks."/><div className="mx-auto grid max-w-xl grid-cols-9 border-4 border-slate-900 bg-white">{Array.from({length:81}).map((_,i)=><div key={i} className={`flex aspect-square items-center justify-center border text-2xl font-black ${(Math.floor(i/9)+1)%3===0?'border-b-2 border-b-slate-900':''} ${(i+1)%3===0?'border-r-2 border-r-slate-900':''}`}>{givens[i]||""}</div>)}</div></main>
}
