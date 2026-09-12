# Local validation status

Status: **LOCAL-VALIDATION**

Attempted `npm install --ignore-scripts --no-audit --no-fund`, but installation timed out in the execution environment and left an incomplete dependency tree.

`npm run typecheck` could not complete because required type packages such as React, Node, Leaflet and related transitive definitions were not fully installed.

A direct TypeScript transpile/syntax check was run against every file changed in v0.63.0 and passed.

Run the full validation commands on the HGN workstation before deployment.
