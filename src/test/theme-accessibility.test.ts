import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Rgb = [number, number, number];

function hslToRgb(h: number, s: number, l: number): Rgb {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const offset = lightness - chroma / 2;
  const [r, g, b] =
    h < 60 ? [chroma, x, 0] :
    h < 120 ? [x, chroma, 0] :
    h < 180 ? [0, chroma, x] :
    h < 240 ? [0, x, chroma] :
    h < 300 ? [x, 0, chroma] : [chroma, 0, x];

  return [r + offset, g + offset, b + offset];
}

function luminance([r, g, b]: Rgb) {
  const linear = [r, g, b].map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(a: Rgb, b: Rgb) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("light theme accessibility", () => {
  it("keeps text color tokens at WCAG AA contrast", () => {
    const css = readFileSync("src/index.css", "utf8");
    const root = css.match(/:root\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
    const color = (name: string) => {
      const match = root.match(new RegExp(`--${name}:\\s*(\\d+)\\s+(\\d+)%\\s+(\\d+)%`));
      if (!match) throw new Error(`Missing ${name} token`);
      return hslToRgb(Number(match[1]), Number(match[2]), Number(match[3]));
    };
    const background = color("background");

    expect(contrast(color("primary"), background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(color("muted-foreground"), background)).toBeGreaterThanOrEqual(4.5);
  });
});
