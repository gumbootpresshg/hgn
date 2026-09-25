import HomePoll from "@/components/HomePoll"

export const dynamic = "force-dynamic"

export default function CommunityPulsePage() {
  return (
    <main className="min-h-[62vh] bg-[radial-gradient(circle_at_top_right,_rgba(30,95,148,.10),_transparent_31rem)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="newspaper-kicker text-hgnRed">Community Pulse</p>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-none text-hgnNavy sm:text-5xl">Have your say</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Vote in the current HGN reader poll and see the results once your vote is in. Your response helps guide our coverage.</p>
        <div className="mt-8">
          <HomePoll variant="community" />
        </div>
      </div>
    </main>
  )
}
