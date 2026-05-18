# HGN v197 — Homepage JSX Build Fix

Fixes:

`Expected ',', got 'ident'`

## Cause

The homepage ad slot was inserted beside `<main>` without a React fragment wrapper.

## Fixed

- Wrapped homepage return in `<>...</>`
- Also guarded article page ad-slot injection the same way

No SQL required.
