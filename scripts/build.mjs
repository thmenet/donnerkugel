// Builds the standalone page from donnerkugel.html (the Artifact source):
//   index.html      -> GitHub Pages
//   www/index.html  -> iOS app (Capacitor)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

// Two Claude sessions (Windows PC and Mac) work on this repo. Never build from a stale copy:
// stop if GitHub has commits this checkout does not have yet.
if (!process.env.SKIP_PULL_CHECK) {
  try {
    execSync("git fetch -q origin main", { stdio: "ignore", timeout: 20000 });
    const behind = Number(execSync("git rev-list --count HEAD..origin/main").toString().trim());
    if (behind > 0) {
      console.error(`\nAbbruch: Auf GitHub gibt es ${behind} neuere Änderung(en). Zuerst "git pull" ausführen, dann nochmals bauen.\n`);
      process.exit(1);
    }
  } catch {
    console.warn("Hinweis: GitHub nicht erreichbar, konnte nicht prüfen, ob der Stand aktuell ist.");
  }
}

const body = readFileSync("donnerkugel.html", "utf8");
const head =
  '<!doctype html><html lang="de"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">' +
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">' +
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="theme-color" content="#0c1214">' +
  '<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">' +
  '<link rel="icon" type="image/png" sizes="192x192" href="favicon-192.png">' +
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">' +
  "<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box}" +
  "body{margin:0;font-size:14px}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n";
const page = head + body + "\n</body></html>\n";

writeFileSync("index.html", page);
mkdirSync("www", { recursive: true });
writeFileSync("www/index.html", page);
console.log("built index.html and www/index.html");
