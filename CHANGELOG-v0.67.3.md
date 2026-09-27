# HGN v0.67.3 — Guide Map & Live Information Cleanup

- Fixed the Island Map initialization race that could leave a usable map without any markers.
- Replaced emoji-style markers with readable HGN map pins, added reset controls and mobile-safe map sizing.
- Kept live camera links out of the physical-place map; they now remain in Island Cams where they belong.
- Removed generic, unverified fallback fuel and camera cards rather than presenting them as current local listings.
- Added `/explore/trackers`: Air & Marine Watch, with current live airport boards for Sandspit and Masset plus independent AIS vessel tracking links.
- Replaced the placeholder Ferry / Flight Tracker, Island Cam Network and Marine Forecast pages with redirects to maintained Guide destinations.
- Expanded Travel and Island Cams with direct official-source links and added mapped Guide places to the public directory.

## Live tracking decision

No unreliable iframe is used for flight or vessel data. Live tracking remains on the specialist providers' pages so their current timestamp, service terms and notices stay visible. A true embedded local tracker should be added only after HGN has a provider agreement or API key.
