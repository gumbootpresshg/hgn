import { supabase } from "@/lib/supabase";

export default async function CommunityPulseCard() {
  const { data: poll } = await supabase
    .from("community_pulse")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!poll) return null;

  const options = [poll.option_one, poll.option_two, poll.option_three, poll.option_four].filter(Boolean);

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">Community Pulse</div>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{poll.question}</h2>
      <div className="mt-4 grid gap-2">
        {options.map((option) => (
          <div key={option} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            {option}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Voting controls can be enabled when the site moves to beta online.</p>
    </section>
  );
}
