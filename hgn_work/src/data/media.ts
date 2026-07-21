export type NewsItem = {
  playerSlug: string;
  title: string;
  source: string;
  date: string;
  url: string;
};

export type VideoItem = {
  playerSlug: string;
  title: string;
  source: string;
  url: string;
};

export const newsItems: NewsItem[] = [
  {
    playerSlug: "gavin-mckenna",
    title: "McKenna continues dominant WHL season",
    source: "Example Hockey News",
    date: "2026-04-10",
    url: "#",
  },
  {
    playerSlug: "ivan-demidov",
    title: "Demidov tracking as elite fantasy prospect",
    source: "Example Fantasy Hockey",
    date: "2026-04-08",
    url: "#",
  },
];

export const videoItems: VideoItem[] = [
  {
    playerSlug: "gavin-mckenna",
    title: "Gavin McKenna highlight package",
    source: "YouTube",
    url: "#",
  },
  {
    playerSlug: "zeev-buium",
    title: "Zeev Buium offensive zone clips",
    source: "YouTube",
    url: "#",
  },
];