# HGN v200 — Header Named Export Fix

Fixes:

`Export Header doesn't exist in target module`

## Cause

`layout.tsx` imports:

`import { Header } from "@/components/Header"`

The v199 replacement only exported Header as default.

## Fixed

- Header now exports both:
  - `export function Header()`
  - `export default Header`

No SQL required.
