const grid = [
  "HAIDAGWAII", "FERRYXXXXX", "WEATHERXXX", "MASSETXXXX", "SKIDEGATE", "SANDSPITXX", "TL ELLXXXXX".replace(/ /g,""), "NEWSXXXXXX", "PUZZLEXXXX", "ISLANDXXXX",
];
const words = ["HAIDA", "GWAII", "FERRY", "WEATHER", "MASSET", "SKIDEGATE", "SANDSPIT", "TLELL", "NEWS", "ISLAND"];

export default function WordSearchPage() {
  return <main className="mx-auto max-w-4xl px-4 py-10"><div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Games</div><h1 className="mt-2 text-5xl font-black text-hgnNavy">Haida Gwaii Word Search</h1><p className="mt-3 text-slate-700">Starter puzzle. Print-friendly now; interactive version can come later.</p><div className="mt-6 grid gap-8 md:grid-cols-[1fr_260px]"><div className="hgn-card p-6"><div className="grid grid-cols-10 gap-1 text-center font-black tracking-widest text-hgnNavy">{grid.join("").split("").map((letter, i) => <div key={i} className="rounded-lg bg-slate-100 p-3">{letter}</div>)}</div></div><aside className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Find these</h2><ul className="mt-4 space-y-2 text-slate-700">{words.map(w => <li key={w} className="font-bold">{w}</li>)}</ul></aside></div></main>;
}
