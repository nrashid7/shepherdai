# Shepherd AI production runbook

## Required platforms

- GitHub repository: `nrashid7/shepherdai`, production branch `main`
- Vercel project: `shepherdai`, Node.js 22, Vite, `npm run build`, output `dist`
- Supabase project: `shepherd-ai-production`, AWS `us-east-2`
- iOS bundle: `com.nrashid7.shepherdai`, iOS 15+, version `1.0.0`

## Supabase provisioning

1. Link the production project and apply migrations in order with `npx supabase db push`.
2. Set confirmed-email Auth, PKCE, site URL `https://shepherdai-beta.vercel.app`, and allow these redirects:
   - `https://shepherdai-beta.vercel.app/auth/callback`
   - `https://shepherdai-beta.vercel.app/reset-password`
   - `com.nrashid7.shepherdai://auth/callback`
3. Set Edge Function secrets: `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `OPENROUTER_HTTP_REFERER`, `OPENROUTER_X_TITLE`, `MODEL_CHAT`, `MODEL_PRAYER`, `MODEL_DEVOTIONAL`, `MODEL_VERSE_CONTEXT`, `OPENROUTER_EMBEDDING_MODEL`, `AI_REQUEST_TIMEOUT_MS`, and `AI_REQUEST_MAX_RETRIES`.
4. Run `npm run seed:data`, `npm run seed:embeddings`, and `npm run seed:validate` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and (for embeddings) `OPENROUTER_API_KEY` set only in the administrative shell. After validation, apply `supabase/post-seed/001_embedding_index.sql`.
5. Deploy exactly: `chat`, `prayer`, `devotional`, `verse-context`, and `delete-account`.
6. Generate TypeScript types, run `supabase/tests/rls.sql`, and review both security and performance advisors.

## Vercel hosting

Set production and preview variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, and `APPLE_TEAM_ID`. Never put the service-role or OpenRouter key in Vercel. The canonical web hostname is `shepherdai-beta.vercel.app`; no purchased domain is required. Confirm the AASA response is JSON and includes the Apple Team ID before testing universal links.

## GitHub and TestFlight secrets

Protect the `testflight` environment and configure: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `APPLE_TEAM_ID`, `APPLE_PROVISIONING_PROFILE_NAME`, `IOS_DISTRIBUTION_CERTIFICATE_BASE64`, `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`, `KEYCHAIN_PASSWORD`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, and `ASC_KEY_BASE64`.

Trigger `.github/workflows/testflight.yml` manually or push an `ios-v*` tag. Test launch, navigation, safe areas, persistence, universal/custom deep links, AI features, offline state, dark mode, and account deletion on a physical iPhone.

## Cutover and rollback

After Vercel production smoke tests and Supabase advisor review pass, use the stable Vercel production alias for cutover. Keep the legacy deployment available but do not change it during the seven-day observation window. Review Vercel and Supabase errors daily. If a release-blocking error appears, keep the legacy site available while fixing forward from GitHub.

After seven clean days, unpublish the legacy site, disconnect its GitHub integration, delete its cloud backend, revoke its secrets, and verify its former hostname no longer serves Shepherd AI. This final removal is intentionally an operational gate, not an automated repository action.
