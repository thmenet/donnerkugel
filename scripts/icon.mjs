// Renders assets/icon.svg to the PNGs the App Store and the web need (no transparency).
import sharp from "sharp";
const svg = "assets/icon.svg", bg = "#0c1214";
await sharp(svg).resize(1024, 1024).flatten({ background: bg }).png().toFile("assets/icon-only.png");
await sharp(svg).resize(180, 180).flatten({ background: bg }).png().toFile("apple-touch-icon.png");
// Splash: small rounded icon centred on the game background
const r = 120, size = 600;
const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="#fff"/></svg>`);
const logo = await sharp(svg).resize(size, size).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
for (const f of ["assets/splash.png", "assets/splash-dark.png"]) {
  await sharp({ create: { width: 2732, height: 2732, channels: 3, background: bg } })
    .composite([{ input: logo, gravity: "centre" }]).png().toFile(f);
}
console.log("icons rendered");
