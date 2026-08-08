# iOS App Store Launch Guide — Shepherd AI

## Prerequisites (Manual Steps)

### 1. Apple Developer Program

1. Go to <https://developer.apple.com/programs/> and enroll ($99/year).
2. Use a personal or organization Apple ID — the same one used for App Store Connect.
3. After enrollment is approved (usually instant for individuals, a few days for orgs), note your **Team ID**.

Bundle ID: `com.shepherdai.app`
Display Name: `Shepherd AI`

### 2. Build Environment (Cloud Mac)

Since you're on Windows, you need a macOS machine with Xcode for the final build/sign/archive steps.

**Recommended:** Rent a cloud Mac from one of these services:

| Service | Pricing | Notes |
|---|---|---|
| [MacinCloud](https://macincloud.com) | ~$1/hr pay-as-you-go | Good for one-off builds |
| [MacStadium](https://macstadium.com) | ~$50/mo dedicated | Better for ongoing development |
| [GitHub Actions macOS](https://github.com/features/actions) | Free tier available | Best for CI/CD after first manual build |

**What to install on the Mac:**
```bash
# Install Xcode from Mac App Store (or xcode-select --install for CLI tools)
# Install Node.js 18+
brew install node

# Clone the repo and install deps
git clone <your-repo-url>
cd shepherdai/shepherdai
npm install
```

### 3. Capacitor iOS Build Flow

All Capacitor setup is done in the codebase already. On the Mac:

```bash
# Build the web app
npm run build

# Sync web assets to the iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

In Xcode:
1. Select the "App" target
2. Under "Signing & Capabilities", select your Apple Developer Team
3. Set Bundle Identifier to `com.shepherdai.app`
4. Select a real device or "Any iOS Device" as the build target
5. Product > Archive
6. Distribute App > App Store Connect > Upload

### 4. Supabase Configuration

Add these to your Supabase project's Auth settings (Dashboard > Authentication > URL Configuration):

**Redirect URLs (add both):**
- `https://shepherdai.app/auth/callback` (for Universal Links)
- `com.shepherdai.app://auth/callback` (fallback custom scheme)

### 5. TestFlight Testing

After uploading to App Store Connect:
1. Go to <https://appstoreconnect.apple.com>
2. Select the app > TestFlight tab
3. Add internal testers (your Apple ID)
4. Install TestFlight on your iPhone and accept the invite

### 6. App Store Submission

In App Store Connect, fill out:

- **App Information:** Name, subtitle, category (Lifestyle or Reference)
- **Privacy Policy URL:** Link to your `/privacy` page
- **Age Rating:** Fill out the questionnaire (no mature content)
- **App Privacy:** Declare data types collected:
  - Email address (Account creation)
  - User content (Chat messages, prayers, devotionals)
  - Usage data (Daily check-ins)
- **Screenshots:** Required sizes:
  - iPhone 6.7" (1290 x 2796px) — iPhone 15 Pro Max
  - iPhone 6.5" (1284 x 2778px) — iPhone 14 Plus
  - iPad Pro 12.9" (2048 x 2732px) — if supporting iPad
- **Description:** 
  > Shepherd AI is your AI-powered Bible companion. Share what's on your heart and receive scripture-grounded guidance, personalized prayers, and multi-day devotionals. Explore the Bible book by book, save verses, and track your spiritual journey — all powered by AI that stays faithful to Scripture.
- **Keywords:** Bible, AI, prayer, devotional, scripture, faith, spiritual, Christian, verse, companion
- **Review Notes:** "This app uses AI (Google Gemini) to provide Bible study assistance and prayer generation. All AI responses are grounded in actual Bible scripture stored in our database. The app includes mental health crisis detection with appropriate resource links."

## Device Testing Checklist

Before submitting to the App Store, test these on a real iPhone via TestFlight:

### Critical Path
- [ ] App launches with splash screen, then shows the landing page
- [ ] Navigation works: tap each tab (Home, Chat, Explore, Prayer, Devotional, Dashboard)
- [ ] Safe areas: content does not overlap the notch or home indicator
- [ ] Bottom tab bar sits above the home indicator
- [ ] Top navbar sits below the status bar

### Authentication
- [ ] Sign up with email/password — confirmation email arrives
- [ ] Tap email confirmation link — app opens and session is set
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Password reset email flow works
- [ ] Delete account from Settings

### Core Features
- [ ] **Chat (SSE streaming):** send a message, AI response streams in token-by-token
- [ ] **Prayer:** select an emotion, prayer generates with verse references
- [ ] **Devotional:** enter a topic, multi-day devotional generates
- [ ] **Explore:** navigate books > chapters > verses
- [ ] **Verse deep-dive:** tap a verse, context loads with study notes
- [ ] **Dashboard:** saved verses, prayers, devotionals appear

### Edge Cases
- [ ] Offline behavior: graceful error when no network
- [ ] Long chat conversations: scroll performance
- [ ] Orientation changes (if landscape is enabled)
- [ ] Dark mode: toggle theme, verify colors

### App Store Review Flags
- [ ] Crisis banner appears when "suicide" or similar terms are sent in chat
- [ ] Privacy, Terms, and Disclaimer pages accessible from the app
- [ ] Account deletion works completely

## Quick Reference: npm Scripts

| Script | Purpose |
|---|---|
| `npm run build` | Production build to `dist/` |
| `npm run cap:sync` | Sync `dist/` to the iOS project |
| `npm run cap:build` | Build + sync in one step |
| `npm run cap:open` | Open the iOS project in Xcode (Mac only) |

## File Map: What Was Added for iOS

| File | Purpose |
|---|---|
| `capacitor.config.ts` | Capacitor configuration (app ID, splash screen, status bar) |
| `ios/` | Generated Xcode project (committed to repo) |
| `src/lib/platform.ts` | Platform detection helpers (`isNativeApp`, `getAuthRedirectUrl`) |
| `scripts/generate-icons.mjs` | Script to regenerate app icon and splash from SVG |
| `IOS_LAUNCH_GUIDE.md` | This file |

## Files Modified for iOS

| File | Change |
|---|---|
| `index.html` | Added `viewport-fit=cover` to viewport meta |
| `src/index.css` | Added `env(safe-area-inset-*)` padding on body |
| `src/main.tsx` | StatusBar and SplashScreen init on native |
| `src/components/Navbar.tsx` | Safe-area padding on top nav and bottom tab bar |
| `src/contexts/AuthContext.tsx` | Platform-aware redirect URL, deep link listener |
| `src/pages/ResetPasswordPage.tsx` | Platform-aware redirect URL |
| `package.json` | Capacitor deps + convenience scripts |
