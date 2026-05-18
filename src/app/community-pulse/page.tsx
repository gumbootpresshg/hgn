import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function CommunityPulsePage() {
  const { data: poll } = await supabase
    .from("community_pulse")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-wide text-hgnBlue">Community Pulse</p>
      <h1 className="mt-2 text-4xl font-black text-hgnNavy">Have your say</h1>
      <p className="mt-3 text-slate-600">A simple reader poll for Haida Gwaii News. Results and comments can help guide coverage.</p>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">{poll?.question || "What should HGN cover more of this week?"}</h2>
        <div className="mt-6 grid gap-3">
          {[poll?.option_one, poll?.option_two, poll?.option_three, poll?.option_four]
            .filter(Boolean)
            .map((option) => (
              <button key={option} className="rounded-xl border px-4 py-3 text-left font-bold hover:bg-slate-50">
                {option}
              </button>
            ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">Voting storage is ready; public vote handling can be wired next.</p>
      </section>
    </main>
  );
}
