import LaunchCard from "@/components/LaunchCard";

export default function DailyUseRail() {
  return (
    <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <LaunchCard title="What's Happening" href="/events">Today, this weekend, meetings, sports, markets and community dates.</LaunchCard>
      <LaunchCard title="Live Map" href="/live-map">Alerts, closures, events, community pins and island updates.</LaunchCard>
      <LaunchCard title="Submit a Notice" href="/notices">Legal, government, legislative, regulatory and required corporate notices for editor review.</LaunchCard>
      <LaunchCard title="Support Local News" href="/support">Help keep Haida Gwaii News free for readers across the islands.</LaunchCard>
    </section>
  );
}
