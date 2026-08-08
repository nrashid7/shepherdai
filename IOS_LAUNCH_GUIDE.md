# Shepherd AI iOS launch guide

The production iOS target is the checked-in Capacitor project under `ios/`.

- Bundle ID: `com.shepherdai.app`
- Display name: `Shepherd AI`
- Release: `1.0.0`
- Minimum iOS: 15
- Toolchain: Node.js 22 and Xcode 26
- Distribution: `.github/workflows/testflight.yml`

The workflow builds the Vite application, runs `cap sync ios`, imports protected signing assets into a temporary keychain, archives the app, and uploads an internal TestFlight build using the App Store Connect API. It uses `github.run_number` as the iOS build number.

For required GitHub secrets, Supabase redirects, production cutover, and the physical-device checklist, follow [docs/PRODUCTION_RUNBOOK.md](docs/PRODUCTION_RUNBOOK.md).
