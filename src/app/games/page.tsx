import GamesPlayer from "@/components/GamesPlayer"
import { supabase } from "@/lib/supabase"
export const dynamic="force-dynamic"
export default async function GamesPage(){const {data}=await supabase.from("hgn_games").select("*").eq("published",true).order("published_at",{ascending:false}).limit(24);return <main className="newspaper-shell py-8"><header className="bg-[#071f35] px-7 py-9 text-[#f4eee3]"><p className="newspaper-kicker text-red-300">HGN Games</p><h1 className="mt-2 font-serif text-5xl font-bold">Puzzles for Haida Gwaii</h1><p className="mt-4 max-w-2xl text-lg text-stone-200">Crosswords, word searches and a fresh Sudoku for every new edition.</p></header><div className="mt-8"><GamesPlayer games={(data||[]) as any[]}/></div></main>}
