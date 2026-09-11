export type RankingCategory = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  draftYear?: string;
  leagueFilter?: string[];
  positionFilter?: string[];
  sourceCategory?: string;
};

export const rankingCategories: RankingCategory[] = [
  {
    slug: "2027-draft",
    title: "2027 NHL Draft Rankings",
    kicker: "Early Watch List",
    description:
      "A starter board for the next draft cycle. Use this as the home for underage CHL, USHL, NCAA, and international prospects as your sources grow.",
    draftYear: "2027",
    sourceCategory: "2027 Draft Rankings",
  },
  {
    slug: "goalies",
    title: "Goalie Prospect Rankings",
    kicker: "Crease Watch",
    description:
      "A filtered board for draft-eligible and drafted goalies. Built to support fantasy value, NHL upside, and long-term pipeline tracking.",
    positionFilter: ["G"],
    sourceCategory: "Goalie Rankings",
  },
  {
    slug: "chl",
    title: "CHL Prospect Rankings",
    kicker: "Major Junior Board",
    description:
      "WHL, OHL, and QMJHL prospects in one place for draft coverage, fantasy scouting, and team pipeline work.",
    leagueFilter: ["WHL", "OHL", "QMJHL", "CHL"],
    sourceCategory: "CHL Rankings",
  },
  {
    slug: "ncaa",
    title: "NCAA Prospect Rankings",
    kicker: "College Watch",
    description:
      "Drafted and draft-eligible NCAA prospects with room for NHLe, production trends, and fantasy upside notes.",
    leagueFilter: ["NCAA"],
    sourceCategory: "NCAA Rankings",
  },
  {
    slug: "team-pipelines",
    title: "NHL Team Pipeline Rankings",
    kicker: "Organization Strength",
    description:
      "A full organization ranking area for top prospects, recent draft picks, goalie depth, and system strength.",
    sourceCategory: "Pipeline Rankings",
  },
];

export function getRankingCategory(slug: string) {
  return rankingCategories.find((category) => category.slug === slug);
}
