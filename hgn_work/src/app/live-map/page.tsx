"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { supabase } from "@/lib/supabase";
import "leaflet/dist/leaflet.css";

type Pin = {
  id?: string;
  type: string;
  title: string;
  area: string;
  lat: number;
  lng: number;
  details: string;
};

const allowedTypes = ["Events", "Garage Sales", "Alerts"];

const typeColors: Record<string, string> = {
  Events: "#ea580c",
  "Garage Sales": "#16a34a",
  Alerts: "rgb(0,204,255)",
};

export default function LiveMap() {
  const [filter, setFilter] = useState("All");
  const [pins, setPins] = useState<Pin[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markerLayer = useRef<any>(null);

  const visible = useMemo(() => (filter === "All" ? pins : pins.filter((p) => p.type === filter)), [filter, pins]);
  const types = ["All", ...allowedTypes];

  useEffect(() => {
    async function loadApprovedPins() {
      const { data, error } = await supabase
        .from("live_map_items")
        .select("id,type,title,area,lat,lng,details,status")
        .eq("status", "approved")
        .in("type", allowedTypes)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data && data.length) {
        const approved = data
          .filter((p: any) => typeof p.lat === "number" && typeof p.lng === "number")
          .map((p: any) => ({ id: p.id, type: p.type || "Events", title: p.title, area: p.area || "Haida Gwaii", lat: p.lat, lng: p.lng, details: p.details || "Approved map item." }));
        setPins(approved);
      }
    }
    loadApprovedPins();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootMap() {
      if (!mapRef.current || mapInstance.current) return;
      const leaflet = await import("leaflet");
      if (cancelled || !mapRef.current) return;
      const L = leaflet.default || leaflet;

      const map = L.map(mapRef.current, { scrollWheelZoom: true, zoomControl: true }).setView([53.62, -132.08], 9);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      markerLayer.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 250);
    }

    bootMap();
    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function drawPins() {
      if (!mapReady || !mapInstance.current || !markerLayer.current) return;
      const leaflet = await import("leaflet");
      const L = leaflet.default || leaflet;
      markerLayer.current.clearLayers();

      visible.forEach((p) => {
        const color = typeColors[p.type] || "#1e40af";
        const icon = L.divIcon({
          className: "hgn-leaflet-pin",
          html: `<div style="background:${color};width:34px;height:34px;border-radius:999px;border:4px solid white;box-shadow:0 10px 24px rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:13px;">•</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -18],
        });

        L.marker([p.lat, p.lng], { icon })
          .bindPopup(`<strong>${p.title}</strong><br/><small>${p.type} · ${p.area}</small><br/>${p.details}`)
          .addTo(markerLayer.current);
      });
    }
    drawPins();
  }, [visible, mapReady]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader
        eyebrow="Open this first"
        title="Haida Gwaii Live Map"
        description="A map-first view for approved events, garage sales and alerts across Haida Gwaii."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === t ? "bg-hgnBlue text-white" : "bg-white text-slate-700 shadow-sm"}`}>
            {t}
          </button>
        ))}
        <Link href="/live-map/submit" className="rounded-full bg-hgnBlue px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-hgnBlue">
          Submit a map item
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div ref={mapRef} className="h-[620px] w-full bg-slate-100" />
          <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {mapReady ? `${visible.length} map item${visible.length === 1 ? "" : "s"} shown.` : "Loading interactive map…"}
          </div>
        </div>
        <aside className="grid gap-3">
          {visible.length === 0 ? <article className="hgn-card p-5 text-sm text-slate-600">No approved events, garage sales or alerts are on the map yet.</article> : null}
          {visible.map((p, index) => (
            <article key={p.id || `${p.title}-${index}`} className="hgn-card p-5">
              <div className="text-xs font-black uppercase text-hgnBlue">{p.type} · {p.area}</div>
              <h2 className="mt-1 text-xl font-black text-hgnNavy">{p.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{p.details}</p>
            </article>
          ))}
        </aside>
      </section>
    </main>
  );
}
