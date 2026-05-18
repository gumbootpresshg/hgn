"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGate, useAdminSession } from "@/components/AdminGate";
import { supabase } from "@/lib/supabase";

type VideoRow = { id: string; player_name: string; player_slug: string | null; title: string; url: string; video_type: string | null; status: string | null; submitted_by: string | null; created_at: string | null };

export default function AdminVideosPage() {
  const { isAuthed } = useAdminSession();
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadVideos() {
    setLoading(true);
    const { data } = await supabase.from("player_videos").select("id, player_name, player_slug, title, url, video_type, status, submitted_by, created_at").order("created_at", { ascending: false }).limit(80);
    setVideos(data || []);
    setLoading(false);
  }

  async function setStatus(id: string, status: string) {
    await supabase.from("player_videos").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    await loadVideos();
  }

  useEffect(() => {
    if (isAuthed) loadVideos();
  }, [isAuthed]);

  if (!isAuthed) return <AdminGate title="Video Manager" eyebrow="PuckScope" description="Approve, reject, and manage submitted player highlights." />;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">← Back to admin</Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-sm uppercase tracking-[0.3em] text-blue-300">PuckScope Media</p><h1 className="mt-3 text-5xl font-black">Video Manager</h1><p className="mt-4 max-w-3xl text-zinc-400">Approve player highlights, interviews, shift-by-shift clips, scouting reports, and full-game links before they appear publicly.</p></div>
          <Link href="/admin/imports" className="rounded-2xl border border-white/10 bg-zinc-900 p-4 text-sm text-zinc-300 hover:border-blue-300">Optional advanced CSV import is now in the <span className="font-bold text-blue-200">Data Import Center</span>.</Link>
        </div>
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950 text-zinc-400"><tr><th className="px-4 py-3">Player</th><th className="px-4 py-3">Video</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="px-4 py-8 text-zinc-500">Loading...</td></tr> : videos.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-zinc-500">No videos submitted yet.</td></tr> : videos.map((video) => <tr key={video.id} className="border-t border-white/10"><td className="px-4 py-4 font-bold">{video.player_slug ? <Link href={`/player/${video.player_slug}`} className="hover:text-blue-300">{video.player_name}</Link> : video.player_name}<p className="mt-1 text-xs text-zinc-500">{video.submitted_by || "Unknown submitter"}</p></td><td className="px-4 py-4"><a href={video.url} target="_blank" className="font-semibold text-blue-300 hover:text-blue-200">{video.title}</a></td><td className="px-4 py-4 text-zinc-300">{video.video_type || "Highlight"}</td><td className="px-4 py-4"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">{video.status || "pending"}</span></td><td className="px-4 py-4"><div className="flex flex-wrap gap-2"><button onClick={() => setStatus(video.id, "approved")} className="rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-200">Approve</button><button onClick={() => setStatus(video.id, "rejected")} className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-bold text-red-200">Reject</button><button onClick={() => setStatus(video.id, "pending")} className="rounded-xl bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200">Pending</button></div></td></tr>)}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
