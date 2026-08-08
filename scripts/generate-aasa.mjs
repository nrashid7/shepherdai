import { mkdirSync, writeFileSync } from "node:fs";

const teamId = process.env.APPLE_TEAM_ID;
if (!teamId) {
  console.warn("APPLE_TEAM_ID is unset; retaining the checked-in AASA placeholder for local builds.");
  process.exit(0);
}

mkdirSync("public/.well-known", { recursive: true });
writeFileSync("public/.well-known/apple-app-site-association", JSON.stringify({
  applinks: {
    details: [{ appIDs: [`${teamId}.com.nrashid7.shepherdai`], components: [{ "/": "/auth/*" }, { "/": "/reset-password*" }] }],
  },
  webcredentials: { apps: [`${teamId}.com.nrashid7.shepherdai`] },
}, null, 2) + "\n");
