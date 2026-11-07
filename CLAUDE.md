# Donnerkugel

Murmel-Rätselspiel fürs iPhone, inspiriert von Mechaniken klassischer Murmelspiele (eigener Name, eigene Grafik, eigene Level). Die Kugel wird durch Neigen des Handys gesteuert, Wischen gibt Schwung. Ziel: Steine anstossen und alle Farbpaare finden (wie Memory). Sprache der App und der Kommunikation mit Thomas: Deutsch (Schweiz, kein ß).

## Stand (November 2026)

- Spiel läuft im Browser: https://thmenet.github.io/donnerkugel/ (GitHub Pages, Branch `main`, Ordner `/`)
- 40 Level. Ziel von Thomas: mindestens 100 Level.
- Neigen, Ton (inkl. iPhone-Stummschalter) und Fingersteuerung funktionieren laut Test von Thomas.
- iOS-App mit Capacitor 8 eingerichtet (Swift Package Manager, keine CocoaPods).
- App Store Connect: App „Donnerkugel“ angelegt, Bundle-ID `ch.menet.donnerkugel`, Team-ID `JQ76949CP7`, Status „In Vorbereitung zur Übermittlung“.
- Datenschutz/Support-URL: https://thmenet.github.io/donnerkugel/privacy.html
- Noch offen: auf dem Mac bauen, auf dem iPhone testen, Archive → Upload → TestFlight, App-Store-Texte, Screenshots (iPhone 6,9"), EU-Händlerstatus (Thomas entscheidet selbst).

## Regeln (wichtig)

- **Zwei Sitzungen arbeiten an diesem Repo** (Windows-PC und Mac). Darum: **vor jeder Arbeit `git pull`**, nach jeder Änderung committen und pushen. `npm run build` bricht ab, wenn GitHub neuere Commits hat.
- **Vor jedem iPhone-Build** (Xcode ▶ oder Archive): `git pull`, dann `npm run sync`. Sonst fehlen neue Level in der App.
- **Das Level „Finale“ ist immer das letzte.** Neue Level werden direkt *vor* dem Finale eingefügt. Die Levelprüfung erzwingt das.
- Levelnamen sind eindeutig. Jedes Level hat einen kurzen Tipp auf Deutsch.
- Neue Level sollen von Level zu Level etwas schwieriger werden und Abwechslung bringen (nicht nur Varianten derselben Idee).

## Dateien

- `donnerkugel.html` – **die einzige Quelle des Spiels** (HTML/CSS/JS in einer Datei, ohne `<html>/<head>`, weil sie auch als Claude-Artifact veröffentlicht wird). Nur diese Datei bearbeiten.
- `scripts/check-levels.mjs` – prüft alle Level (Grösse, Paare, Erreichbarkeit inkl. Schalter/Tore, Finale zuletzt, eindeutige Namen). Läuft automatisch bei `npm run build`, einzeln mit `npm run check`.
- `scripts/build.mjs` – erzeugt daraus `index.html` (GitHub Pages) und `www/index.html` (App).
- `assets/icon.svg` → `scripts/icon.mjs` rendert App-Symbol, Splash und `apple-touch-icon.png`.
- `privacy.html` – Datenschutz- und Supportseite.
- `ios/` – Xcode-Projekt (Capacitor). Angepasst: nur Hochformat, nur iPhone (`TARGETED_DEVICE_FAMILY = 1`), `NSMotionUsageDescription`, `ITSAppUsesNonExemptEncryption = false`, helle Statusleiste, Bildschirm bleibt an (`isIdleTimerDisabled` in `AppDelegate.swift`), `DEVELOPMENT_TEAM` gesetzt.

## Befehle

```bash
npm install            # einmalig (das iOS-Projekt verweist auf node_modules)
npm run sync           # build + npx cap sync ios – nach jeder Änderung am Spiel
npm run icons          # Symbol und Splash neu erzeugen
npx cap open ios       # Xcode öffnen
```

Nach Änderungen: `npm run sync`, committen, pushen (GitHub Pages ist nach ~1 Min aktuell). Commits auf Deutsch.

## Spiel-Technik (Kurzüberblick)

- Raster 11×15 Felder, Level als Textkarten im Array `LEVELS`: `#` Wand, `.` Boden, `@` Start, `a–f` Farbsteine (je genau zwei), `_` Abgrund, `~` Eis, `:` Sand, `g` Glas (bricht bei Tempo), `s` Schalter, `=` Tor zu, `-` Tor offen.
- Physik in Feld-Einheiten (`ACC`, `MAXV`, `BOUNCE`, `IMPULSE`, `GLASS_BREAK`, `TILT_RANGE` oben im Skript).
- Neigung über `deviceorientation` (iOS: `DeviceOrientationEvent.requestPermission()` beim Tippen), wird beim Levelstart kalibriert.
- Haptik: in der App über `window.Capacitor.Plugins.Haptics` (Plugin `@capacitor/haptics`), im Browser `navigator.vibrate`.
- Ton: Web Audio, `navigator.audioSession.type = "playback"`, Freischaltung bei `touchend`/`click`.
- Fortschritt und Einstellungen in `localStorage` (Schlüssel `donnerkugel.*`).

## Ideen für später

- Weitere Level bis mindestens 100 (vor dem Finale einfügen)

- App-Store-Texte (Untertitel, Beschreibung, Suchbegriffe) auf Deutsch, evtl. Englisch
- Screenshots für das iPhone
