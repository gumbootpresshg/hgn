# HGN v199 — Header JSX Fix

Fixes:

`Unexpected token. Did you mean {'}'} or &rbrace;?`

## Cause

The previous header patch inserted a fragment into the existing Header component incorrectly.

## Fixed

- Replaced Header with a clean valid component
- Utility menu now contains:
  - Support Us
  - Advertise With Us
  - About Us
  - Contact Us
- Main nav remains separate below

No SQL required.
