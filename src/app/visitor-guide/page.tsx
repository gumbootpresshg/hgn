import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/SectionHeader";
import AdSlot from "@/components/AdSlot";

export const revalidate = 60;

const towns = ["All", "Masset", "Old Massett", "Port Clements", "Tlell", "Skidegate", "Daajing Giids", "Sandspit", "Island-wide"];
const categories = ["Stay", "Eat", "Explore", "Services", "Shops", "Tours", "Emergency", "Transportation"];

const fallbackListings = [
  { title: "Getting Around Haida Gwaii", town: "Island-wide", category: "Transportation", description: "Ferries, local drives, visitor planning and practical travel notes for moving around the islands.", slug: "getting-around-haida-gwaii" },
  { title: "Emergency Contacts", town: "Island-wide", category: "Emergency", description: "Quick access to health, police, fire, emergency and visitor safety information.", slug: "emergency-contacts" },
  { title: "Places to Eat", town: "Island-wide", category: "Eat", description: "Restaurants, cafes, takeout, groceries and local food options submitted by businesses and editors.", slug: "places-to-eat" },
  { title: "Trails, Beaches and Outdoor Stops", town: "Island-wide", category: "Explore", description: "A growing visitor list of beaches, walks, viewpoints, parks and community favourites.", slug: "trails-beaches-outdoor-stops" },
];

async function getListings() {
  const { data } = await supabase
    .from("visitor_listings")
    .select("*")
    .in("status", ["approved", "published"])
    .order("featured", { ascending: false })
    .order("title", { ascending: true });
  return data?.length ? data : fallbackListings;
}

export default async function VisitorGuide() {
  const listings: any[] = await getListings();
  const featured = listings.filter((item) => item.featured).slice(0, 3);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader
        eyebrow="Visitor Information"
        title="Haida Gwaii Visitor Guide"
        description="A practical scroll-first guide for places to stay, eat, explore, shop and get around. Businesses and locals can submit updates for editor approval."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Link href="/visitor-guide/submit" className="hgn-card p-5 hover:shadow-md">
          <div className="text-xs font-black uppercase tracking-widest text-hgnBlue">Submit</div>
          <h2 className="mt-1 text-xl font-black text-hgnNavy">Add a place</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Business, attraction, service, tour, restaurant, emergency info or visitor tip.</p>
        </Link>
        <Link href="/ferry-tracker" className="hgn-card p-5 hover:shadow-md"><b>Ferries & travel</b><p className="mt-2 text-sm text-slate-600">Schedules, updates and travel planning links.</p></Link>
        <Link href="/weather" className="hgn-card p-5 hover:shadow-md"><b>Weather</b><p className="mt-2 text-sm text-slate-600">Town forecasts, marine conditions and wind maps.</p></Link>
        <Link href="/events" className="hgn-card p-5 hover:shadow-md"><b>Events</b><p className="mt-2 text-sm text-slate-600">What is happening around the islands.</p></Link>
      </section>

      <section className="mt-8">
        <AdSlot placement="visitor_guide_top" />
      </section>

      {!!featured.length && (
        <section className="mt-10">
          <h2 className="border-b pb-3 text-3xl font-black text-hgnNavy">Featured visitor picks</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {featured.map((item) => <ListingCard key={item.id || item.slug || item.title} item={item} />)}
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-5">
          <div className="hgn-card p-5">
            <h3 className="font-black text-hgnNavy">Towns</h3>
            <div className="mt-3 flex flex-wrap gap-2 lg:block lg:space-y-2">
              {towns.map((town) => <a key={town} href={`#${town.toLowerCase().replaceAll(" ", "-")}`} className="block rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-hgnNavy hover:bg-hgnBlue hover:text-white">{town}</a>)}
            </div>
          </div>
          <div className="hgn-card p-5">
            <h3 className="font-black text-hgnNavy">Categories</h3>
            <div className="mt-3 flex flex-wrap gap-2 lg:block lg:space-y-2">
              {categories.map((category) => <a key={category} href={`#cat-${category.toLowerCase()}`} className="block rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-hgnNavy hover:bg-hgnBlue hover:text-white">{category}</a>)}
            </div>
          </div>
        </aside>

        <div className="space-y-10">
          {categories.map((category) => {
            const group = listings.filter((item) => (item.category || "").toLowerCase() === category.toLowerCase());
            if (!group.length) return null;
            return <section key={category} id={`cat-${category.toLowerCase()}`}><h2 className="border-b pb-3 text-2xl font-black text-hgnNavy">{category}</h2><div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{group.map((item) => <ListingCard key={item.id || item.slug || item.title} item={item} />)}</div></section>;
          })}
          <section id="all"><h2 className="border-b pb-3 text-2xl font-black text-hgnNavy">All visitor listings</h2><div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{listings.map((item) => <ListingCard key={item.id || item.slug || item.title} item={item} />)}</div></section>
        </div>
      </section>
    </main>
  );
}

function ListingCard({ item }: { item: any }) {
  const href = item.slug ? `/visitor-guide/${item.slug}` : "/visitor-guide";
  return (
    <Link href={href} className="hgn-card block overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
      {item.image_url && <img src={item.image_url} alt="" className="h-40 w-full object-cover" />}
      <div className="p-5">
        <div className="text-xs font-black uppercase tracking-widest text-hgnBlue">{item.category || "Visitor"} • {item.town || "Haida Gwaii"}</div>
        <h3 className="mt-2 text-xl font-black text-hgnNavy">{item.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-hgnNavy">
          {item.phone && <span className="rounded-full bg-slate-100 px-3 py-1">Call</span>}
          {item.website && <span className="rounded-full bg-slate-100 px-3 py-1">Website</span>}
          {item.hours && <span className="rounded-full bg-slate-100 px-3 py-1">Hours</span>}
        </div>
      </div>
    </Link>
  );
}
