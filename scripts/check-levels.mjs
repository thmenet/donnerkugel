// Checks every level in donnerkugel.html:
//  - 11 columns x 15 rows, only known characters, exactly one start
//  - every colour stone appears exactly twice
//  - every stone can be touched: a passable neighbour is reachable from the start.
//    Reachability is searched over (cell, switch parity): rolling onto a switch toggles all gates.
//    Glass counts as passable (it can be broken), abysses do not.
//    Explosive crates (x) the ball can touch are blown up: that clears glass and brittle walls (w)
//    in the 3x3 around them and sets off crates there (chain). The search repeats until nothing
//    more explodes.
//  - the level "Finale" is the last one, level names are unique
import { readFileSync } from "node:fs";

const src = readFileSync("donnerkugel.html", "utf8");
const m = src.match(/const LEVELS = (\[[\s\S]*?\n\]);/);
if (!m) { console.error("LEVELS not found"); process.exit(1); }
const LEVELS = Function(`return ${m[1]}`)();

const COLS = 11, ROWS = 15, OK = new Set("#.@_~:gs=-abcdefxw");
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
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
  const cells = g.map(row => row.split(""));
  const inside = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
  const at = (r, c) => inside(r, c) ? cells[r][c] : "#";
  let start = null; const count = {};
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = at(r, c);
    if (ch === "@") { if (start) fail(i, "mehr als ein Start"); start = [r, c]; }
    if ("abcdef".includes(ch)) count[ch] = (count[ch] || 0) + 1;
  }
  if (!start) { fail(i, "kein Start"); return; }
  for (const [k, n] of Object.entries(count)) if (n !== 2) fail(i, `Stein "${k}" kommt ${n}x vor`);
  if (!Object.keys(count).length) fail(i, "keine Steine");

  const blow = (r, c) => {
    cells[r][c] = ".";
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (!inside(nr, nc)) continue;
      const ch = cells[nr][nc];
      if (ch === "w" || ch === "g") cells[nr][nc] = ".";
      else if (ch === "x") blow(nr, nc);
    }
  };
  // passable for a given parity p (0 = gates as drawn, 1 = toggled)
  const pass = (ch, p) => ".@~:gs".includes(ch) || (ch === "-" && p === 0) || (ch === "=" && p === 1);
  let reach, changed = true;
  while (changed) {
    changed = false;
    const seen = new Set(), q = [[start[0], start[1], 0]];
    reach = new Set();
    seen.add(`${start[0]},${start[1]},0`);
    while (q.length) {
      const [r, c, p] = q.shift();
      reach.add(`${r},${c}`);
      for (const [dr, dc] of N4) {
        const nr = r + dr, nc = c + dc, ch = at(nr, nc);
        if (!pass(ch, p)) continue;
        const np = ch === "s" ? 1 - p : p;   // entering a switch flips all gates
        const key = `${nr},${nc},${np}`;
        if (!seen.has(key)) { seen.add(key); q.push([nr, nc, np]); }
      }
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (at(r, c) === "x" && N4.some(([dr, dc]) => reach.has(`${r + dr},${c + dc}`))) { blow(r, c); changed = true; }
    }
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = at(r, c);
    if (!"abcdef".includes(ch)) continue;
    const ok = N4.some(([dr, dc]) => reach.has(`${r + dr},${c + dc}`));
    if (!ok) fail(i, `Stein "${ch}" in Zeile ${r}, Spalte ${c} ist nicht erreichbar`);
  }
});

// Rule: the level called "Finale" is always the last one (new levels go before it)
const fin = LEVELS.map((L, i) => L.name === "Finale" ? i : -1).filter(i => i >= 0);
if (fin.length !== 1 || fin[0] !== LEVELS.length - 1) {
  errors++;
  console.log(`Das Level "Finale" muss genau einmal vorkommen und das letzte sein (jetzt an Position ${fin.map(i => i + 1).join(", ") || "keine"} von ${LEVELS.length}). Neue Level vor dem Finale einfügen.`);
}
const names = LEVELS.map(L => L.name), dup = names.filter((n, i) => names.indexOf(n) !== i);
if (dup.length) { errors++; console.log(`Doppelte Levelnamen: ${[...new Set(dup)].join(", ")}`); }
console.log(errors ? `${errors} Fehler` : `Alle ${LEVELS.length} Level in Ordnung`);
process.exit(errors ? 1 : 0);
