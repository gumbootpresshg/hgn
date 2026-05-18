export const ferryRoutes = [
  {
    title: "Prince Rupert ↔ Skidegate",
    description: "Mainland route between Prince Rupert and Graham Island / Skidegate.",
    currentConditions: "https://www.bcferries.com/current-conditions/PPR-PSK",
    reverseConditions: "https://www.bcferries.com/current-conditions/PSK-PPR",
    schedule: "https://www.bcferries.com/routes-fares/schedules/seasonal/PR-SK",
    notices: "https://www.bcferries.com/travel-boarding/travel-advisories",
    phone: "1-888-223-3779",
  },
  {
    title: "Skidegate ↔ Alliford Bay",
    description: "Inter-island route between Graham Island / Skidegate and Moresby Island / Alliford Bay.",
    currentConditions: "https://www.bcferries.com/current-conditions/PSK-ALF",
    reverseConditions: "https://www.bcferries.com/current-conditions/ALF-PSK",
    schedule: "https://www.bcferries.com/routes-fares/schedules/seasonal/ALF-PSK",
    notices: "https://www.bcferries.com/travel-boarding/travel-advisories",
    phone: "1-888-223-3779",
  },
]

export const tideStations = [
  { name: "Masset", slug: "masset", official: "https://tides.gc.ca/en/stations" },
  { name: "Skidegate", slug: "skidegate", official: "https://tides.gc.ca/en/stations" },
  { name: "Daajing Giids / Queen Charlotte", slug: "daajing-giids", official: "https://tides.gc.ca/en/stations" },
  { name: "Sandspit", slug: "sandspit", official: "https://tides.gc.ca/en/stations" },
  { name: "Rose Spit", slug: "rose-spit", official: "https://tides.gc.ca/en/stations" },
  { name: "Naden Harbour", slug: "naden-harbour", official: "https://tides.gc.ca/en/stations" },
]

export const emergencyLinks = [
  {
    title: "Earthquakes Canada — Haida Gwaii",
    href: "https://earthquakescanada.nrcan.gc.ca/index-en.php?tpl_region=qci",
    description: "Recent significant earthquakes in the Haida Gwaii region.",
  },
  {
    title: "Earthquakes Canada — Last 30 Days",
    href: "https://www.seismescanada.rncan.gc.ca/index-en.php?tpl_region=qci",
    description: "All recorded earthquakes in the region during the last 30 days.",
  },
  {
    title: "Environment Canada Tsunami Alerts",
    href: "https://weather.gc.ca/warnings/report_tsunami_e.html?mesoCode=tsu1",
    description: "Official tsunami warning and alert page for coastal British Columbia.",
  },
  {
    title: "EmergencyInfoBC",
    href: "https://www.emergencyinfobc.gov.bc.ca/",
    description: "Provincial emergency updates and public safety notices.",
  },
  {
    title: "PreparedBC",
    href: "https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc",
    description: "Emergency preparedness information for earthquakes, tsunamis and extreme weather.",
  },
]

export const weatherTowns = [
  { name: "Masset", slug: "masset", query: "Masset, BC", description: "North island weather, wind and marine conditions." },
  { name: "Old Massett", slug: "old-massett", query: "Old Massett, BC", description: "North coast conditions and nearby Masset weather." },
  { name: "Port Clements", slug: "port-clements", query: "Port Clements, BC", description: "Central island weather and inland conditions." },
  { name: "Tlell", slug: "tlell", query: "Tlell, BC", description: "East coast weather, wind and rural road conditions." },
  { name: "Skidegate", slug: "skidegate", query: "Skidegate, BC", description: "East coast weather and ferry-area conditions." },
  { name: "Daajing Giids", slug: "daajing-giids", query: "Daajing Giids, BC", description: "Village weather and nearby marine conditions." },
  { name: "Sandspit", slug: "sandspit", query: "Sandspit, BC", description: "Moresby Island weather and airport-area conditions." },
]
