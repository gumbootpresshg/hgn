export type LiveStatRow = {
  id: string;
  player_slug: string | null;
  season: string | null;
  team: string | null;
  league: string | null;
  games_played: number | null;
  goals: number | null;
  assists: number | null;
  points: number | null;
  points_per_game: number | null;
  nhle_points: number | null;
  save_percentage: number | null;
  goals_against_average: number | null;
  source: string | null;
  source_updated_at: string | null;
};

export function formatStat(value: string | number | null | undefined, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

export function formatNumber(value: number | null | undefined, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(decimals).replace(/\.0$/, "");
}

export function statFreshnessLabel(dateValue: string | null | undefined) {
  if (!dateValue) return "No update logged";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "No update logged";
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  return `Updated ${days} days ago`;
}

export function projectionFromStats(row: LiveStatRow | null | undefined) {
  if (!row) return "Needs current stats";
  if (row.save_percentage !== null && row.save_percentage !== undefined) {
    if (row.save_percentage >= 0.92) return "Goalie stock rising";
    if (row.save_percentage >= 0.905) return "Goalie tracking well";
    return "Goalie development watch";
  }
  const nhle = row.nhle_points || 0;
  if (nhle >= 65) return "Star production signal";
  if (nhle >= 45) return "Top-six scoring signal";
  if (nhle >= 28) return "NHL regular signal";
  return "Development watch";
}
