"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Expanded default categories including Real Estate so the form can handle real‑estate listings properly.
const fallbackCats = ["Vehicles", "Rentals", "Real Estate", "Jobs", "Services", "Equipment", "Firewood", "Fishing Gear", "Local Crafts", "Buy / Sell", "Community Notice"];
const fallbackTowns = ["Masset", "Old Massett", "Port Clements", "Tlell", "Skidegate", "Daajing Giids", "Sandspit", "Other / Island-wide"];

async function uploadListingPhoto(file: File | null) {
  if (!file || file.size === 0) return "";
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `marketplace/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("hgn-media").upload(filePath, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("hgn-media").getPublicUrl(filePath);
  return data.publicUrl;
}

export default function NewMarketplaceListing() {
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [cats, setCats] = useState(fallbackCats);
  const [towns, setTowns] = useState(fallbackTowns);
  // Track the currently selected category so we can show category‑specific fields
  const [category, setCategory] = useState<string>("");

  // Normalize the selected category to lowercase for more robust matching
  const lowerCat = category?.toLowerCase() || "";
  // Keyword lists for category detection.  These ensure synonyms and plurals are handled consistently.
  const jobKeywords = [
    "job",
    "jobs",
    "employment",
  ];
  const realEstateKeywords = [
    "rental",
    "rentals",
    "real estate",
    "real-estate",
    "realestate",
    "estate",
    "property",
    "properties",
    "housing",
    "land",
    "home",
    "house",
    "apartment",
    "condo",
  ];
  const vehicleKeywords = [
    "vehicle",
    "vehicles",
    "car",
    "cars",
    "truck",
    "trucks",
    "boat",
    "boats",
    "motorcycle",
    "motorcycles",
    "rv",
    "rvs",
  ];
  // Flags to determine which extra field sets to show based on the selected category
  const isJobCategory = jobKeywords.some((k) => lowerCat.includes(k));
  const isRealEstateCategory = realEstateKeywords.some((k) => lowerCat.includes(k));
  const isVehicleCategory = vehicleKeywords.some((k) => lowerCat.includes(k));

  useEffect(() => {
    async function loadSettings() {
      const [{ data: catRows }, { data: townRows }] = await Promise.all([
        supabase.from("marketplace_categories").select("name").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("marketplace_towns").select("name").eq("is_active", true).order("sort_order", { ascending: true }),
      ]);
      if (catRows?.length) setCats(catRows.map((r: any) => r.name));
      if (townRows?.length) setTowns(townRows.map((r: any) => r.name));
    }
    loadSettings();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const f = new FormData(e.currentTarget);
      const file = f.get("photo") as File | null;
      const image_url = await uploadListingPhoto(file);
      // Build the base payload from the form fields
      const payload: any = {
        title: f.get("title"),
        category: f.get("category"),
        location: f.get("location"),
        description: f.get("description"),
        price: f.get("price"),
        contact_name: f.get("contact_name"),
        contact_email: f.get("contact_email"),
        phone: f.get("phone"),
        image_url,
        status: "pending",
      };
      // Capture selected category for conditional fields and normalize it
      const selectedCat = String(f.get("category") || "").toLowerCase();
      // Determine flags using the same keyword lists defined above
      const isJobListing = jobKeywords.some((k) => selectedCat.includes(k));
      const isRealEstateListing = realEstateKeywords.some((k) => selectedCat.includes(k));
      const isVehicleListing = vehicleKeywords.some((k) => selectedCat.includes(k));
      // If a job listing, append employment type and rate of pay
      if (isJobListing) {
        payload.employment_type = f.get("employment_type");
        payload.rate_of_pay = f.get("rate_of_pay");
      }
      // If a real estate or rental listing, append property details and extra photos
      if (isRealEstateListing) {
        payload.address = f.get("address");
        payload.property_type = f.get("property_type");
        payload.bedrooms = f.get("bedrooms");
        payload.bathrooms = f.get("bathrooms");
        payload.square_feet = f.get("square_feet");
        payload.lot_size = f.get("lot_size");
        const extraPhotos: string[] = [];
        const extraFiles = [f.get("photo2"), f.get("photo3"), f.get("photo4")];
        for (const extra of extraFiles) {
          if (extra instanceof File && extra.size > 0) {
            const url = await uploadListingPhoto(extra as File);
            if (url) extraPhotos.push(url);
          }
        }
        if (extraPhotos.length) payload.additional_photos = extraPhotos;
      }
      // If this is a vehicle/car/truck/boat listing, append vehicle‑specific fields
      if (isVehicleListing) {
        payload.make = f.get("make");
        payload.model = f.get("model");
        payload.year = f.get("year");
        payload.mileage = f.get("mileage");
        payload.transmission = f.get("transmission");
        payload.colour = f.get("colour");
      }
      const { error } = await supabase.from("classifieds").insert(payload);
      if (error) {
        const response = await fetch("/api/submit/classified", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || error.message);
      }
      setOk(true);
    } catch (err: any) { alert(err.message || "Upload failed"); }
    finally { setSaving(false); }
  }

  if (ok) return <main className="mx-auto max-w-2xl px-4 py-10"><div className="hgn-card p-6"><h1 className="text-3xl font-black text-hgnNavy">Listing submitted</h1><p className="mt-3 text-slate-700">HGN will review it before publishing.</p><Link className="hgn-btn-primary mt-5" href="/marketplace">Back to marketplace</Link></div></main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Marketplace</div>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Post a Marketplace Listing</h1>
      <p className="mt-3 text-slate-700">Add a town, phone number, upload photos, and submit your listing for HGN review. Works well from phones.</p>
      <form onSubmit={submit} className="hgn-card mt-6 grid gap-4 p-6">
        <label>Title<input name="title" required placeholder="Example: Firewood for sale, 2008 truck, rental wanted" /></label>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            Category
            <select
              name="category"
              value={category || ""}
              onChange={(e) => setCategory(e.target.value)}
            >
              {/* Empty option to prompt selection on first render */}
              {!category && <option value="" disabled>Select category</option>}
              {cats.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Town / Location
            <select name="location" required>
              {towns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>Description<textarea name="description" rows={7} required placeholder="Details, condition, pickup/delivery info..." /></label>
        <div className="grid gap-4 md:grid-cols-2"><label>Price<input name="price" placeholder="$100 or Contact seller" /></label><label>Phone<input name="phone" type="tel" inputMode="tel" placeholder="250-000-0000" /></label></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            Contact Name
            <input name="contact_name" required />
          </label>
          <label>
            Email
            <input name="contact_email" type="email" required />
          </label>
        </div>

        {/* Show job‑specific fields when the Jobs category is selected */}
        {isJobCategory && (
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              Employment type
              <select name="employment_type">
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Seasonal">Seasonal</option>
                <option value="Casual">Casual</option>
              </select>
            </label>
            <label>
              Rate of pay (optional)
              <input name="rate_of_pay" placeholder="$25/hour" />
            </label>
          </div>
        )}

        {/* Show real estate / rental specific fields when the corresponding category is selected */}
        {isRealEstateCategory && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                Address
                <input name="address" placeholder="1234 Main St" />
              </label>
              <label>
                Property type
                <select name="property_type">
                  <option value="House">House</option>
                  <option value="Cabin">Cabin</option>
                  <option value="Land">Land</option>
                  <option value="Mobile Home">Mobile Home</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Waterfront">Waterfront</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <label>
                Bedrooms
                <input name="bedrooms" type="number" min="0" />
              </label>
              <label>
                Bathrooms
                <input name="bathrooms" type="number" min="0" />
              </label>
              <label>
                Sq. ft. (optional)
                <input name="square_feet" type="number" min="0" />
              </label>
              <label>
                Lot size (optional)
                <input name="lot_size" type="number" min="0" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                Photo 2
                <input name="photo2" type="file" accept="image/*" />
              </label>
              <label>
                Photo 3
                <input name="photo3" type="file" accept="image/*" />
              </label>
              <label>
                Photo 4
                <input name="photo4" type="file" accept="image/*" />
              </label>
            </div>
          </>
        )}

        {/* Show vehicle/car/truck/boat specific fields when the corresponding category is selected */}
        {isVehicleCategory && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                Make
                <input name="make" placeholder="Ford" />
              </label>
              <label>
                Model
                <input name="model" placeholder="F-150" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                Year
                <input name="year" type="number" min="1886" placeholder="2020" />
              </label>
              <label>
                Mileage (km)
                <input name="mileage" type="number" min="0" placeholder="123000" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                Transmission
                <select name="transmission">
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                Colour
                <input name="colour" placeholder="Red" />
              </label>
            </div>
          </>
        )}

        <label>
          Photo
          <input
            name="photo"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : "");
            }}
          />
        </label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Listing preview"
            className="max-h-72 rounded-2xl object-cover"
          />
        )}
        <button disabled={saving} className="hgn-btn-primary">
          {saving ? "Uploading..." : "Submit listing"}
        </button>
      </form>
    </main>
  );
}
