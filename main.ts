// Leonida Trophy Atlas — the entry program (Node 22, standard library only).
//
// What this program does, in three steps:
//   1. Copy this repository's app/ (the guide: index.html, app.js, roadmap.js,
//      style.css, data/trophies.json) into the output directory.
//   2. Copy screenshots/ alongside it.
//   3. Write dossier.json there with the kit's vendored buildDossier, so the
//      judge reads exactly the screenshots, first-load files and source the
//      scorer will check.
//
// The guide itself is plain static files under app/: no build step, no network
// at run time, progress in localStorage. vendor/makefun-frontend.ts is the
// kit's copy and must stay byte-identical — the scorer rebuilds the dossier
// with its own copy and compares the two byte for byte.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (inside the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used.)
// It is deterministic: run it twice and the outputs are byte-identical.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const here = fileURLToPath(new URL('.', import.meta.url));
// The grader writes to /output; local runs override with MAKEFUN_OUTPUT_DIR.
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the other limits refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB, or app/ past 993 files and directories
// or 48 MiB (app/ shares /output's own 1000-entry cap with screenshots/ and
// dossier.json, so the guide is kept small on purpose).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
