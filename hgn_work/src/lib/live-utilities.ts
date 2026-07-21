export const ferryRoutes = [
  {
    name: "Prince Rupert ↔ Skidegate",
    description: "Main BC Ferries route connecting Haida Gwaii to mainland British Columbia.",
    links: [
      { label: "Current Conditions", href: "https://www.bcferries.com/current-conditions" },
      { label: "Schedules", href: "https://www.bcferries.com/routes-fares/schedules" },
      { label: "Service Notices", href: "https://www.bcferries.com/travel-boarding/travel-advisories" },
    ],
  },
  {
    name: "Skidegate ↔ Alliford Bay",
    description: "Inter-island ferry connection between Graham Island and Moresby Island.",
    links: [
      { label: "Current Conditions", href: "https://www.bcferries.com/current-conditions" },
      { label: "Schedules", href: "https://www.bcferries.com/routes-fares/schedules" },
      { label: "Service Notices", href: "https://www.bcferries.com/travel-boarding/travel-advisories" },
    ],
  },
]

export const powerOutageLinks = [
  {
    title: "BC Hydro Outage Map",
    description: "Current power outages shown on BC Hydro's live outage map.",
    href: "https://www.bchydro.com/power-outages/app/outage-map.html",
  },
  {
    title: "BC Hydro Outage List",
    description: "Current outages and outage status by municipality.",
    href: "https://www.bchydro.com/power-outages/",
  },
  {
    title: "Report an Outage",
    description: "Call 1-800-BCHYDRO / 1-800-224-9376 or *HYDRO / *49376 from a mobile phone.",
    href: "tel:18002249376",
  },
  {
    title: "Prepare for Outages",
    description: "BC Hydro outage preparedness and safety information.",
    href: "https://www.bchydro.com/outages/orsmapview.jsp",
  },
]

export const roadConditionLinks = [
  {
    title: "DriveBC — Haida Gwaii / Highway 16",
    description: "Road conditions, closures, webcams and delays from DriveBC.",
    href: "https://www.drivebc.ca/",
  },
  {
    title: "DriveBC Skidegate Camera",
    description: "Real-time highway camera and local road condition information near Skidegate.",
    href: "https://www.drivebc.ca/cameras/197",
  },
  {
    title: "Haida Gwaii Weather Cams",
    description: "Haida Gwaii road/weather camera links and highway information.",
    href: "https://bchighway.com/video/haida-gwaii",
  },
]

export const weatherStations = [
  { name: "Masset", href: "https://weather.gc.ca/city/pages/bc-85_metric_e.html" },
  { name: "Sandspit", href: "https://weather.gc.ca/city/pages/bc-83_metric_e.html" },
  { name: "Daajing Giids", href: "https://weather.gc.ca/" },
  { name: "Marine Weather", href: "https://weather.gc.ca/marine/" },
  { name: "Weather Warnings", href: "https://weather.gc.ca/warnings/index_e.html?prov=bc" },
]

export const tideStations = [
  { name: "Masset Inlet", href: "https://tides.gc.ca/en/stations" },
  { name: "Skidegate", href: "https://tides.gc.ca/en/stations" },
  { name: "Sandspit", href: "https://tides.gc.ca/en/stations" },
]

export const emergencyFeeds = [
  {
    title: "Earthquakes Canada",
    description: "Recent earthquakes and regional seismic activity.",
    href: "https://earthquakescanada.nrcan.gc.ca/index-en.php?tpl_region=qci",
  },
  {
    title: "PreparedBC",
    description: "Emergency preparedness and public safety information.",
    href: "https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc",
  },
  {
    title: "EmergencyInfoBC",
    description: "Provincial emergency updates and public alerts.",
    href: "https://www.emergencyinfobc.gov.bc.ca/",
  },
  {
    title: "Environment Canada Weather Alerts",
    description: "Official weather watches and warnings.",
    href: "https://weather.gc.ca/warnings/index_e.html?prov=bc",
  },
  {
    title: "Environment Canada Tsunami Feed",
    description: "Live tsunami alert feed for Zone A: the North Coast and Haida Gwaii.",
    href: "https://weather.gc.ca/rss/battleboard/tsu1_t_e.xml",
  },
]

export const airportInfo = [
  {
    name: "Masset Municipal Airport",
    description: "North island regional airport. The Village of Masset notes flights to Masset Municipal Airport (ZMT) from Vancouver South Terminal through Pacific Coastal Airlines.",
    href: "https://massetbc.com/visitors/airport/",
  },
  {
    name: "K’il Kun Xidgwangs Daanaay Airport (Sandspit)",
    description: "Transport Canada-operated airport serving Haida Gwaii from Sandspit.",
    href: "https://tc.canada.ca/en/aviation/operating-airports-aerodromes/list-airports-owned-transport-canada/kil-kun-xidgwangs-daanaay-airport",
  },
  {
    name: "Haida Tourism — Getting Here",
    description: "Travel information for flights to Sandspit and Masset.",
    href: "https://www.haidatourism.ca/getting-here",
  },
]
