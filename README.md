# Courtly — Sports Facility Booking App

Mobile take-home submission for **Software Engineer (App & Web Focused) @ Hyge**.

Courtly lets users browse sports facilities in Jakarta, check court availability, book hourly slots, and manage their bookings — integrated with the [Courtly REST API](https://courtly-api.hyge.web.id/api/docs).

## Quick start (reviewers)

### Install the APK (recommended)

> **Clone note:** The APK is stored via Git LFS. After cloning, run `git lfs pull` to download it.

1. Download [`releases/courtly-android.apk`](releases/courtly-android.apk) from this repo
2. Install on an Android device (enable "Install from unknown sources" if prompted)
3. Open Courtly → **Create an account** or sign in with a test account (see below)

### Run from source

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) or press `w` for web preview.

> API base URL is hard-coded to `https://courtly-api.hyge.web.id` — no env file needed.

### Test account

| Field | Value |
|---|---|
| Email | `courtly.test.0904@example.com` |
| Password | `Password123!` |

Or register a new account in-app (password: min 8 chars, 1 uppercase, 1 number).

---

## Features

| Requirement | Implementation |
|---|---|
| Register & login | `/(auth)/register`, `/(auth)/login` with React Hook Form + Zod |
| Secure JWT storage | `expo-secure-store` (Keychain / Keystore) |
| Auto-logout on 401 | API client notifies auth store → route guard redirects to login |
| Facility list | Infinite scroll, search (debounced), sport & city filters |
| Facility detail | Description, amenities, courts, pricing, hero image |
| Availability | 14-day date strip, hourly slot grid (07:00–22:00) per court |
| Book a slot | Consecutive multi-slot selection, sequential API calls |
| My bookings | Upcoming / Past / Cancelled tabs |
| Booking detail | Price breakdown, cancel, add to calendar |
| Android APK | `releases/courtly-android.apk` (EAS internal build) |

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Expo SDK 57 + React Native | Required stack; latest stable |
| Language | TypeScript (strict) | Type safety across API ↔ UI |
| Navigation | Expo Router (file-based) | Typed routes, deep linking, tab + stack |
| Data fetching | TanStack Query v5 | Cache, retry, infinite scroll, invalidation |
| Auth state | Zustand | Lightweight; pairs well with SecureStore |
| Forms | React Hook Form + Zod | Client validation + shared schemas with API |
| Styling | StyleSheet + design tokens | No extra UI lib; full control over dark theme |

---

## Expo modules (5 used — requirement: ≥3)

| Module | Where used | Why |
|---|---|---|
| **expo-secure-store** | Auth token persistence | JWT must not live in AsyncStorage — uses OS secure enclave |
| **expo-image** | Facility cards, detail hero, booking thumbnails | Disk + memory cache, smooth transitions, better perf than `<Image>` |
| **expo-haptics** | Buttons, filter chips, slot selection, booking success/error | Tactile feedback on key interactions |
| **expo-linear-gradient** | Facility detail hero overlay | Smooth fade from photo into dark background |
| **expo-calendar** | "Add to calendar" on booking detail | Saves court time as a native calendar event post-booking |

---

## Architecture

```
src/
├── app/                  # Expo Router screens (file = route)
│   ├── (auth)/           # Login, register (unauthenticated)
│   └── (app)/            # Tab navigator + nested detail screens
├── api/                  # HTTP client, Zod schemas, endpoint functions
├── components/           # Shared UI (Button, Skeleton, cards, grids)
├── lib/                  # Formatters, debounce, calendar helper
├── stores/               # Zustand (auth)
└── theme/                # Design tokens (colors, spacing, radius)
```

### API client design

Every response is validated at runtime with **Zod schemas** derived from the Swagger spec. If the backend changes shape, the app fails loudly in development instead of rendering `undefined`.

```typescript
// Simplified flow
fetch(url) → parse JSON → schema.safeParse() → typed data | ApiError
```

Protected routes automatically attach `Authorization: Bearer <token>`. A 401 from any endpoint triggers logout via a module-level callback (`auth-token.ts`), avoiding circular imports between the client and auth store.

### Multi-slot booking

The API accepts **one hourly slot per `POST /v1/bookings` call** (multi-hour ranges return `INVALID_BOOKING_SLOT`). The app lets users select consecutive slots in the UI, then books them sequentially. If a mid-chain slot gets taken (409), the chain stops, availability refreshes, and the user picks again.

### Cache strategy (TanStack Query)

| Query | staleTime | Rationale |
|---|---|---|
| Sports / cities | ∞ | Static lookup data |
| Facilities list | 60s default | Changes infrequently |
| Availability | 15s | Slots can be booked by others |
| Bookings | 60s default | Invalidated after create/cancel |

---

## API discoveries (not in Swagger)

Documented here for reviewer transparency:

1. **Register returns a token** — same shape as login (`LoginResponseDto`), so the app auto-signs-in after registration.
2. **Facilities pagination** — `?page=1&limit=10` works; response includes `{ data, pagination }`.
3. **Bookings list is paginated** — response includes `pagination` (Swagger omits it).
4. **Booking slots are strictly 1 hour** — `startTime`/`endTime` must span exactly one hourly window.
5. **Service fee** — 5% of slot price, returned as `serviceFee` in the booking response.

---

## Build the APK

Requires a free [Expo](https://expo.dev) account.

```bash
# One-time setup
npx eas-cli login
npx eas-cli init          # links project to your Expo account

# Build internal APK (cloud, ~15 min)
npx eas-cli build --platform android --profile preview

# Download the .apk from the Expo dashboard, then:
mkdir -p releases
cp ~/Downloads/*.apk releases/courtly-android.apk
git add releases/courtly-android.apk && git commit -m "chore: add Android APK"
```

The `preview` profile in `eas.json` sets `buildType: "apk"` for sideloading (no Play Store).

---

## Project structure (routes)

| Route | Screen |
|---|---|
| `/(auth)/login` | Sign in |
| `/(auth)/register` | Create account |
| `/(app)/` | Explore — facility list |
| `/(app)/facility/[id]` | Facility detail |
| `/(app)/book/[facilityId]` | Availability & booking |
| `/(app)/bookings` | My bookings (tabbed) |
| `/(app)/booking/[id]` | Booking detail + cancel |
| `/(app)/profile` | User profile + sign out |

---

## Submission checklist

- [x] Source code
- [x] README.md
- [x] Android APK at `releases/courtly-android.apk`

**Email to:** `recruitment@hyge.sg`

**Subject:** `Software Engineer Mobile & Web Test Submission — [Your Full Name]`

```
Full Name: [Your Full Name]
GitHub Repository: [public URL or invite hyge-sg]
Notes for reviewer (optional): Tested on Android 14 via sideloaded APK.
```

---

## License

MIT — take-home assessment project.
