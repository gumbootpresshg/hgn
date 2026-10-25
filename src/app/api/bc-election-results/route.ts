import { NextResponse } from "next/server"

export const revalidate = 180
const source = "https://results.elections.bc.ca/Results_11684_GE-2026-10-24_Candidate.html"
const clean = (value:string) => value.replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&#39;/g,"'").replace(/&amp;/g,"&").replace(/\s+/g," ").trim()
const number = (value:string) => Number(clean(value).replace(/[^0-9]/g,"")) || 0

type Candidate = { name:string; party:string; votes:number; percent:string }
type District = { district:string; candidates:Candidate[]; advance:string; final:string }

function parse(html:string) {
  const districts = new Map<string, District>()
  let current = ""
  const rows = html.matchAll(/<tr[^>]*data-ed="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/gi)
  for (const row of rows) {
    const district = clean(row[1]); const body = row[2]; const cells = [...body.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(cell => clean(cell[1]))
    if (!district) continue
    if (!districts.has(district)) districts.set(district, { district, candidates: [], advance: "", final: "" })
    current = district
    const target = districts.get(current)!
    const full = clean(body)
    if (/Advance voting ballot boxes/i.test(full)) { target.advance = full.replace(/^.*?Advance voting ballot boxes\s*\|\s*/i, ""); continue }
    if (/Final Voting Day ballot boxes/i.test(full)) { target.final = full.replace(/^.*?Final Voting Day ballot boxes\s*\|\s*/i, ""); continue }
    if (cells.length >= 5 && cells[2] && /\d/.test(cells[3] || "")) {
      const candidate = { name: cells[1], party: cells[2], votes: number(cells[3]), percent: cells[4] }
      if (candidate.name && !/Total|Rejected/i.test(candidate.name) && !target.candidates.some(item => item.name === candidate.name)) target.candidates.push(candidate)
    }
  }
  return [...districts.values()].map(district => ({ ...district, candidates: district.candidates.sort((a,b) => b.votes - a.votes) })).filter(district => district.candidates.length)
}

export async function GET() {
  try {
    const response = await fetch(source, { next: { revalidate: 180 }, headers: { "User-Agent": "Haida-Gwaii-News-results-tracker/1.0" } })
    if (!response.ok) throw new Error(`Elections BC returned ${response.status}`)
    const html = await response.text(); const districts = parse(html)
    const pageUpdated = clean((html.match(/As of\s*([^<]{1,100})/i) || [])[1] || "")
    const focus = districts.find(item => item.district.toLowerCase() === "north coast-haida gwaii") || null
    return NextResponse.json({ source: "https://results.elections.bc.ca/", sourceUpdated: pageUpdated || null, fetchedAt: new Date().toISOString(), focus, districts }, { headers: { "Cache-Control": "public, s-maxage=180, stale-while-revalidate=60" } })
  } catch (error:any) { return NextResponse.json({ error: error?.message || "Live results are temporarily unavailable." }, { status: 502 }) }
}
