import { readFileSync } from "node:fs";
import sharp from "sharp";
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

describe("iOS App Store icon", () => {
  it("is a 1024px PNG without an alpha channel", async () => {
    const metadata = await sharp(
      "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png",
    ).metadata();

    expect(metadata).toMatchObject({
      format: "png",
      width: 1024,
      height: 1024,
      hasAlpha: false,
    });
  });
});

describe("iOS export compliance", () => {
  it("declares that the app does not use non-exempt encryption", () => {
    const infoPlist = readFileSync("ios/App/App/Info.plist", "utf8");

    expect(infoPlist).toMatch(
      /<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/,
    );
  });
});

describe("iOS device support", () => {
  it("ships as an iPhone app until the iPad experience is tested", () => {
    const project = readFileSync("ios/App/App.xcodeproj/project.pbxproj", "utf8");

    expect(project).not.toContain('TARGETED_DEVICE_FAMILY = "1,2";');
    expect(project.match(/TARGETED_DEVICE_FAMILY = 1;/g)).toHaveLength(2);
  });
});

describe("iOS privacy manifest", () => {
  it("declares the account and user content collected for app functionality", () => {
    const manifest = readFileSync("ios/App/App/PrivacyInfo.xcprivacy", "utf8");

    expect(manifest).toContain("NSPrivacyCollectedDataTypeEmailAddress");
    expect(manifest).toContain("NSPrivacyCollectedDataTypeUserID");
    expect(manifest).toContain("NSPrivacyCollectedDataTypeOtherUserContent");
    expect(manifest).toContain("NSPrivacyCollectedDataTypeSensitiveInfo");
    expect(manifest).toContain("NSPrivacyCollectedDataTypePurposeAppFunctionality");
  });
});
