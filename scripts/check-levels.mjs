// Checks every level in donnerkugel.html:
//  - 11 columns x 15 rows, only known characters, exactly one start
//  - every colour stone appears exactly twice
//  - every stone can be touched: a passable neighbour is reachable from the start.
//    Reachability is searched over (cell, switch parity): rolling onto a switch toggles all gates.
//    Glass counts as passable (it can be broken), abysses do not.
import { readFileSync } from "node:fs";

const src = readFileSync("donnerkugel.html", "utf8");
const m = src.match(/const LEVELS = (\[[\s\S]*?\n\]);/);
if (!m) { console.error("LEVELS not found"); process.exit(1); }
const LEVELS = Function(`return ${m[1]}`)();

const COLS = 11, ROWS = 15, OK = new Set("#.@_~:gs=-abcdef");
let errors = 0;
const fail = (i, msg) => { errors++; console.log(`Level ${i + 1} (${LEVELS[i].name}): ${msg}`); };

LEVELS.forEach((L, i) => {
  const g = L.map;
  if (g.length !== ROWS) fail(i, `${g.length} Zeilen statt ${ROWS}`);
  g.forEach((row, r) => {
    if (row.length !== COLS) fail(i, `Zeile ${r} hat ${row.length} Zeichen: "${row}"`);
    for (const ch of row) if (!OK.has(ch)) fail(i, `unbekanntes Zeichen "${ch}" in Zeile ${r}`);
  });
  if (!L.tip) fail(i, "kein Tipp");
  const at = (r, c) => (r >= 0 && r < ROWS && c >= 0 && c < COLS) ? g[r][c] : "#";
  let start = null; const count = {};
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = at(r, c);
    if (ch === "@") { if (start) fail(i, "mehr als ein Start"); start = [r, c]; }
    if ("abcdef".includes(ch)) count[ch] = (count[ch] || 0) + 1;
  }
  if (!start) { fail(i, "kein Start"); return; }
  for (const [k, n] of Object.entries(count)) if (n !== 2) fail(i, `Stein "${k}" kommt ${n}x vor`);
  if (!Object.keys(count).length) fail(i, "keine Steine");

  // passable for a given parity p (0 = gates as drawn, 1 = toggled)
  const pass = (ch, p) => ".@~:gs".includes(ch) || (ch === "-" && p === 0) || (ch === "=" && p === 1);
  const seen = new Set(), reach = new Set(), q = [[start[0], start[1], 0]];
  seen.add(`${start[0]},${start[1]},0`);
  while (q.length) {
    const [r, c, p] = q.shift();
    reach.add(`${r},${c}`);
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc, ch = at(nr, nc);
      if (!pass(ch, p)) continue;
      const np = ch === "s" ? 1 - p : p;
      // a gate that closes under you would push you back; entering a switch flips parity
      const key = `${nr},${nc},${np}`;
      if (!seen.has(key)) { seen.add(key); q.push([nr, nc, np]); }
    }
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = at(r, c);
    if (!"abcdef".includes(ch)) continue;
    const ok = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => reach.has(`${r + dr},${c + dc}`));
    if (!ok) fail(i, `Stein "${ch}" in Zeile ${r}, Spalte ${c} ist nicht erreichbar`);
  }
});
console.log(errors ? `${errors} Fehler` : `Alle ${LEVELS.length} Level in Ordnung`);
process.exit(errors ? 1 : 0);
