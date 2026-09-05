# Courtly

A mobile app for browsing sports facilities and booking courts in Jakarta. Built with Expo and React Native.

Courtly lets you discover venues, check real-time availability, book hourly slots, and manage your bookings — all from your phone.

## Features

- **Browse facilities** — search, filter by sport and city, infinite scroll
- **Facility details** — photos, amenities, courts, and pricing
- **Book courts** — pick a date, select hourly slots (07:00–22:00), book consecutive hours
- **My bookings** — upcoming, past, and cancelled tabs with full detail
- **Add to calendar** — save confirmed bookings to your device calendar
- **Secure auth** — register, login, persistent session with encrypted token storage

## Screenshots

_Screenshots coming soon._

## Getting started

### Prerequisites

- Node.js 18+
- npm
- [Expo Go](https://expo.dev/go) on your phone (for development), or install the pre-built APK below

### Install & run

```bash
git clone https://github.com/adindamochamad/courtly.git
cd courtly
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` / `w` for Android emulator, iOS simulator, or web.

### Install the Android APK

A pre-built APK is available at [`releases/courtly-android.apk`](releases/courtly-android.apk).

> The APK is stored via Git LFS. After cloning, run `git lfs pull` to download it.

1. Transfer the APK to your Android device
2. Enable "Install from unknown sources" if prompted
3. Open Courtly and create an account

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 57 · React Native |
| Language | TypeScript (strict) |
| Navigation | Expo Router |
| Data fetching | TanStack Query |
| Auth state | Zustand + expo-secure-store |
| Forms | React Hook Form + Zod |
| Styling | StyleSheet + design tokens |

## Expo modules

| Module | Purpose |
|---|---|
| `expo-secure-store` | Secure JWT storage (Keychain / Keystore) |
| `expo-image` | Cached images with smooth transitions |
| `expo-haptics` | Tactile feedback on interactions |
| `expo-linear-gradient` | Hero image overlay on facility detail |
| `expo-calendar` | Save bookings to device calendar |

## Project structure

```
src/
├── app/           # Expo Router screens
│   ├── (auth)/    # Login & register
│   └── (app)/     # Main tabs + detail screens
├── api/           # HTTP client, Zod schemas, endpoints
├── components/    # Shared UI components
├── lib/           # Utilities (formatters, calendar, debounce)
├── stores/        # Zustand stores
└── theme/         # Design tokens
```

## API

The app connects to the Courtly REST API:

- **Base URL:** `https://courtly-api.hyge.web.id`
- **Docs:** [Swagger](https://courtly-api.hyge.web.id/api/docs)

All API responses are validated at runtime with Zod schemas. Protected routes attach a Bearer token automatically; expired sessions trigger a logout and redirect to login.

## Build

Requires an [Expo](https://expo.dev) account.

```bash
npx eas-cli login
npm run build:apk
```

The `preview` profile in `eas.json` produces an internal APK for sideloading.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run build:apk` | Build Android APK via EAS |

## License

MIT
