# HGN v224 — Live Tide API

## Added

The Tide Desk now uses real Canadian Hydrographic Service data.

## New files

- `src/app/api/tides/[station]/route.ts`
- `src/components/LiveTideCards.tsx`

## How it works

- Looks up the station using the official CHS/IWLS station code.
- Pulls official `wlp` tide prediction data.
- Estimates next high and next low tide from the prediction curve.
- Shows upcoming tide changes.
- Falls back to official station links if the API is unavailable.

## Stations wired

- Masset — 09910
- Daajing Giids / Queen Charlotte — 09850
- Port Clements — 09920
- Tlell — 09860
- Sandspit Marina — 09795
- Rose Harbour — 09713

## Important source

The Canadian Hydrographic Service provides the official Integrated Water Level System API for water level predictions, observations and station data.

## SQL

No SQL required.
