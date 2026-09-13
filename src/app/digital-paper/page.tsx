import { supabase } from "@/lib/supabase"
import { SectionHeader } from "@/components/SectionHeader"
import { ArchiveNewsstand } from "@/components/archive/ArchiveNewsstand"
export const revalidate=60
export default async function DigitalPaper(){const{data}=await supabase.from('digital_editions').select('*').eq('status','published').order('issue_date',{ascending:false}).limit(250);return <main className="mx-auto max-w-7xl px-4 py-10"><SectionHeader eyebrow="Haida Gwaii News" title="Archive Newsstand" description="Step up to the rack. Browse, search and open past print editions of Haida Gwaii News."/><div className="mt-8"><ArchiveNewsstand editions={data||[]}/></div></main>}
