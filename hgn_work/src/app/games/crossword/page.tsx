import { SectionHeader } from "@/components/SectionHeader";

const clues = [
  ["Across", "1", "Island newspaper initials"],
  ["Across", "4", "A common ferry destination"],
  ["Down", "1", "A community north of Tlell"],
  ["Down", "2", "What readers send to the editor"],
];

export default function Crossword(){
  return <main className="mx-auto max-w-5xl px-4 py-10"><SectionHeader eyebrow="Games & Puzzles" title="Haida Gwaii Crossword" description="A starter crossword area for daily or weekly local puzzles. Editors can replace this with real crossword embeds later."/><div className="grid gap-8 lg:grid-cols-[1fr_320px]"><div className="grid max-w-xl grid-cols-9 gap-1">{Array.from({length:81}).map((_,i)=>{const black=[2,3,10,17,21,25,31,37,41,45,49,55,59,63,70,77,78].includes(i);return <div key={i} className={`aspect-square border text-xs ${black?'bg-slate-900':'bg-white'}`}>{!black && <span className="p-1 text-slate-400">{i%7===0?i+1:""}</span>}</div>})}</div><aside className="hgn-card p-5"><h2 className="text-xl font-black text-hgnNavy">Clues</h2>{clues.map(([dir,num,clue])=><p key={dir+num} className="mt-3 text-sm"><b>{dir} {num}.</b> {clue}</p>)}</aside></div></main>
}
