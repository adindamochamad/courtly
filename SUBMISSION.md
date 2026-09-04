# Submission — Courtly Take-Home Test

## Repository

**GitHub:** https://github.com/adindamochamad/courtly

## Email template

**To:** `recruitment@hyge.sg`  
**Subject:** `Software Engineer Mobile & Web Test Submission — Adinda Mochamad`

```
Full Name: Adinda Mochamad
GitHub Repository: https://github.com/adindamochamad/courtly
Notes for reviewer (optional): Tested on Android via sideloaded APK (releases/courtly-android.apk). Clone with git lfs pull to download the APK.
```

> Replace the name above with your legal full name if different.

## Pre-submission checklist

- [x] Source code pushed to public GitHub
- [x] README.md with setup, architecture, Expo modules
- [x] Android APK at `releases/courtly-android.apk` (Git LFS)
- [x] TypeScript strict — no errors
- [x] ESLint — no errors
- [x] All routes compile (Expo export verified)
- [x] API integration smoke-tested (auth, facilities, booking, cancel)
- [x] EAS build succeeded (profile: preview, internal APK)

## QA test plan (manual — run on APK)

| # | Flow | Expected |
|---|---|---|
| 1 | Register new account | Auto-login, lands on Explore |
| 2 | Sign out → Sign in | Returns to Explore with session restored after app restart |
| 3 | Explore → search "padel" | Filtered results |
| 4 | Filter sport + city | Combined filters work |
| 5 | Tap facility → Check availability | Slot grid loads |
| 6 | Select slot → Book now | Success screen with reference |
| 7 | My Bookings → Upcoming | New booking appears |
| 8 | Tap booking → Cancel | Status becomes Cancelled |
| 9 | Add to calendar | Permission prompt → event saved |
| 10 | Kill app → reopen | Still logged in |

## Test credentials

| Email | Password |
|---|---|
| `courtly.test.0904@example.com` | `Password123!` |

## Build info

| Item | Value |
|---|---|
| EAS Build ID | `8ad6e829-865d-474e-a582-bb4d7eecdcfb` |
| Build URL | https://expo.dev/accounts/adindamochamad/projects/courtly/builds/8ad6e829-865d-474e-a582-bb4d7eecdcfb |
| APK size | ~102 MB |
| Expo SDK | 57 |
| Package | `com.courtly.app` |
