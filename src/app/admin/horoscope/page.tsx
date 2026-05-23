// Admin page for managing horoscope ads. Allows publishers to create a new
// horoscope card and manage existing ones. The actual editing of a card is
// delegated to the generic ad manager (/admin/ads/[id]).
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Ad = Record<string, any>;

export default function AdminHoroscopePage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("placement_key", "horoscope")
      .order("sort_order", { ascending: true });
    if (error) setMessage(error.message);
    setAds(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCard() {
    setWorking("create");
    setMessage("");
    try {
      const { data, error } = await supabase
        .from("ads")
        .insert({
          title: "New Horoscope",
          placement_key: "horoscope",
          status: "draft",
          rotation_weight: 1,
        })
        .select("id")
        .single();
      if (error) {
        setMessage(error.message);
      } else if (data?.id) {
        router.push(`/admin/ads/${data.id}`);
        return;
      }
    } finally {
      setWorking("");
    }
  }

  async function deleteCard(ad: Ad) {
    if (!window.confirm("Delete this horoscope card?")) return;
    setWorking(ad.id);
    const { error } = await supabase.from("ads").delete().eq("id", ad.id);
    if (error) {
      setMessage(error.message);
    } else {
      await load();
    }
    setWorking("");
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <Link href="/admin" className="text-sm font-semibold text-slate-600">
        ← Back to Admin
      </Link>
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Horoscope</h1>
        <p className="mt-3 text-slate-600">
          Create and manage horoscope cards shown on the public horoscope page. Cards
          are managed as ads with placement key <code>horoscope</code>.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={createCard}
            disabled={working === "create"}
            className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {working === "create" ? "Creating…" : "New Card"}
          </button>
          <button
            onClick={load}
            disabled={working === "refresh"}
            className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            Refresh
          </button>
        </div>
        {message ? (
          <p className="mt-4 rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">{message}</p>
        ) : null}
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6">Loading horoscope cards…</p>
      ) : ads.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6">No horoscope cards yet.</p>
      ) : (
        <section className="space-y-4">
          {ads.map((ad) => (
            <article key={ad.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{ad.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {ad.status} · weight {ad.rotation_weight || 1}
                  </p>
                </div>
                {ad.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ad.image_url}
                    alt={ad.alt_text || ad.title}
                    className="h-16 w-32 rounded-xl object-cover"
                  />
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/admin/ads/${ad.id}`}
                  className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
                >
                  Edit
                </Link>
                <button
                  disabled={working === ad.id}
                  onClick={() => deleteCard(ad)}
                  className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
