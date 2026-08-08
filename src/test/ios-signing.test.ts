import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("iOS release signing", () => {
  it("uses an Apple Distribution identity for archive builds", () => {
    const project = readFileSync("ios/App/App.xcodeproj/project.pbxproj", "utf8");
    const releaseConfiguration = project.match(
      /504EC3151FED79650016851F \/\* Release \*\/ = \{[\s\S]*?\n\s*\};/,
    )?.[0];

    expect(releaseConfiguration).toContain('CODE_SIGN_IDENTITY = "Apple Distribution";');
  });
});
