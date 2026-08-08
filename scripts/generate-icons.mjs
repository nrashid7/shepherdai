#!/usr/bin/env node
/**
 * Generates the iOS app icon (1024x1024 PNG) and splash screen assets
 * from the favicon SVG.
 *
 * Prerequisites: npm install --save-dev sharp
 * Usage: node scripts/generate-icons.mjs
 */
import { readFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error(
      "sharp is required. Install it first:\n  npm install --save-dev sharp\n"
    );
    process.exit(1);
  }

  const svgPath = resolve(ROOT, "public/favicon.svg");
  const svgBuffer = readFileSync(svgPath);

  // --- App Icon (1024x1024) ---
  const iconDir = resolve(
    ROOT,
    "ios/App/App/Assets.xcassets/AppIcon.appiconset"
  );
  if (!existsSync(iconDir)) mkdirSync(iconDir, { recursive: true });

  await sharp(svgBuffer)
    .resize(1024, 1024)
    .flatten({ background: "#C4923A" })
    .png()
    .toFile(resolve(iconDir, "AppIcon-512@2x.png"));

  console.log("Created AppIcon-512@2x.png (1024x1024)");

  // --- Splash screen (2732x2732, centered logo on gold background) ---
  const splashDir = resolve(
    ROOT,
    "ios/App/App/Assets.xcassets/Splash.imageset"
  );
  if (!existsSync(splashDir)) mkdirSync(splashDir, { recursive: true });

  const splashSize = 2732;
  const logoSize = 400;

  const logoPng = await sharp(svgBuffer).resize(logoSize, logoSize).png().toBuffer();

  const splash = await sharp({
    create: {
      width: splashSize,
      height: splashSize,
      channels: 4,
      background: { r: 196, g: 146, b: 58, alpha: 1 }, // #C4923A
    },
  })
    .composite([
      {
        input: logoPng,
        left: Math.round((splashSize - logoSize) / 2),
        top: Math.round((splashSize - logoSize) / 2),
      },
    ])
    .png()
    .toBuffer();

  for (const suffix of ["", "-1", "-2"]) {
    await sharp(splash)
      .toFile(resolve(splashDir, `splash-2732x2732${suffix}.png`));
  }

  console.log("Created splash-2732x2732.png, splash-2732x2732-1.png, splash-2732x2732-2.png");
  console.log("\nDone! Run `npx cap sync ios` to update the iOS project.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
