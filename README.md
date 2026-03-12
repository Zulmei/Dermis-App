# ☀ Dermis — UV & Skin Guardian

> A production-ready Expo React Native app for real-time UV tracking, personalized safe exposure timing, and sun safety guidance. Built to spec against the frozen Dermis UI v1.0, with full Back4App authentication and session persistence.

---

## Quick Start

```bash
cd dermis
npm install
npx expo start --clear
```

Scan the QR code with **Expo Go** on your iPhone or Android device.

> **Note:** Always use `--clear` after significant file changes to avoid Metro bundler cache issues.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Language | TypeScript (strict) |
| Navigation | React Navigation 6 (native stack + bottom tabs) |
| Animations | React Native Reanimated 3 |
| SVG | react-native-svg |
| Gradients | expo-linear-gradient |
| Location | expo-location |
| Secure Storage | expo-secure-store |
| Local Storage | @react-native-async-storage/async-storage |
| Auth & Backend | Back4App (Parse SDK) |
| UV API | OpenUV (`/api/v1/uv`, `/api/v1/forecast`) |
| Weather API | OpenWeatherMap Current Weather 2.5 |
| Gestures | react-native-gesture-handler |
| Dev Environment | VS Code, MacBook Air, Expo Go on iPhone |

---

## Project Structure

```
dermis/
├── App.tsx                        # Root — Parse init + GestureHandlerRootView + AppProvider + AppNavigator
├── app.json                       # Expo config (SDK 54, bundle ID: com.dermis.app)
├── babel.config.js
├── tsconfig.json
└── src/
    ├── config/
    │   └── parse.ts               # Parse/Back4App initialization (setAsyncStorage → initialize)
    ├── theme/
    │   └── tokens.ts              # ★ Single source of truth for all design tokens
    ├── data/
    │   └── mockData.ts            # All mock data + TypeScript types (UVData, WeatherData, etc.)
    ├── state/
    │   └── AppState.tsx           # React Context — auth, profile, timer, live UV/weather, location
    ├── services/
    │   ├── authService.ts         # Back4App auth (signUp, signIn, signOut, restoreSession, passwordReset)
    │   ├── profileStore.ts        # AsyncStorage profile persistence keyed by Parse user ID
    │   ├── uvService.ts           # OpenUV API wrapper (graceful mock fallback)
    │   ├── weatherService.ts      # OpenWeatherMap wrapper (graceful mock fallback)
    │   └── historyService.ts      # AsyncStorage exposure history persistence
    ├── utils/
    │   ├── format.ts              # formatTimer, uvColor, skinTypeName, spfLabel, hexToRgba…
    │   └── timerCalc.ts           # Fitzpatrick × SPF × UV safe exposure calculator
    ├── components/
    │   ├── Button.tsx             # 6 variants: primary / secondary / ghost / danger / gold / amberOrange
    │   ├── Card.tsx               # 4 variants: default / alert / premium / teal
    │   ├── CircularTimer.tsx      # SVG countdown ring (stroke-dashoffset technique)
    │   ├── Input.tsx              # Focus-animated text field
    │   ├── ProgressBar.tsx        # Solid or gradient fill, auto-turns red at >100%
    │   ├── ScreenWrapper.tsx      # SafeAreaView + optional ScrollView
    │   ├── Toggle.tsx             # Animated iOS-style toggle
    │   └── UVBarChart.tsx         # Flex-based UV bar chart (no canvas/SVG)
    ├── screens/                   # All 18 screens (see Screen Inventory below)
    └── navigation/
        ├── AppNavigator.tsx       # Full RN Navigation (auth stack + tab navigator)
        └── DevScreenPicker.tsx    # Dev-only pill nav bar for jumping to any screen
```

---

## Screen Inventory

### Auth Group (5 screens)
| Screen | Description |
|---|---|
| `SplashScreen` | Animated brand loading screen — dual-gate: waits for session restore AND 2.4 s brand moment |
| `AuthLandingScreen` | Entry point — Create Account / Sign In / Guest CTAs |
| `SignUpScreen` | Registration form wired to Back4App — inline validation + error banners |
| `SignInScreen` | Email + password login wired to Back4App — inline validation + error banners |
| `ForgotPasswordScreen` | Parse password reset email — form + confirmation state |

### Onboarding Group (4 screens)
| Screen | Description |
|---|---|
| `OnboardingWelcomeScreen` | Feature highlights carousel |
| `OnboardingSkinScreen` | Fitzpatrick scale card selector (6 skin types) |
| `OnboardingSunscreenScreen` | SPF chip picker + reapply reminder + water toggle |
| `LocationPermissionScreen` | GPS prompt — calls `expo-location`, stores coords, marks onboarding complete |

### Main Group (9 screens)
| Screen | Description |
|---|---|
| `HomeScreen` | UV card + circular exposure timer + solar budget + quick insights |
| `ExposureActiveScreen` | Full-screen countdown mode with pause / end controls |
| `SunscreenAlertScreen` | Reapply modal — resets SPF timer on confirm |
| `ForecastScreen` | Bar chart of today's hourly UV + hourly breakdown list |
| `InsightsScreen` | Scrollable educational card feed (6 science-backed articles) |
| `HistoryScreen` | Weekly bar chart + stats row + daily exposure log |
| `ProfileScreen` | User account details, skin profile, and sign out |
| `SettingsScreen` | Notifications, location, units, data sources, privacy |
| `PremiumScreen` | Dermis Pro upsell with feature list and purchase CTA |

---

## Authentication & Session Persistence

Authentication is powered by **Back4App** (Parse Platform). The session architecture is designed to survive Expo Go JS bundle reloads without invalidating server-side sessions.

### Architecture

```
Sign In / Sign Up
  └─ Parse.User.logIn() / user.signUp()
       └─ Session token → SecureStore (iOS Keychain / Android Keystore)
            └─ Profile + onboardingComplete → AsyncStorage (keyed by Parse user ID)

App Launch / JS Reload
  └─ authService.restoreSession()
       ├─ 1. Read token from SecureStore
       └─ 2. Parse.User.become(token) → validates with Back4App server
            └─ AppState loads profile from AsyncStorage → sets live UI state

Sign Out
  └─ Parse.User.logOut() → deletes _Session on Back4App
       └─ SecureStore token cleared → profile reset to defaults in memory
            (AsyncStorage profile is kept so settings restore on next sign-in)
```

### Why SecureStore instead of Parse's built-in session storage

`parse/react-native` requires `AsyncStorage` for its network layer, but when given control of session storage it attempts to reconcile its in-memory state with AsyncStorage on every JS bundle reload. After a reload, in-memory state is wiped but AsyncStorage still holds the old user — Parse detects this mismatch and calls `logOut()` on the server, deleting the `_Session` record on Back4App even though the user never signed out.

The fix: Parse's user cache is cleared from AsyncStorage immediately after `Parse.initialize()`. The session token is stored exclusively in `expo-secure-store` (iOS Keychain / Android Keystore), which is never wiped by Expo Go reloads. On every launch, `Parse.User.become(token)` rehydrates the session with a single server round-trip.

### Profile Persistence

User profile data (skin type, SPF, reminders, onboarding state) is stored in AsyncStorage under `@dermis/profile/<userId>`. It is:
- **Saved** automatically whenever `setProfile()` or `setOnboardingComplete()` is called from any screen
- **Loaded** immediately after session restore and sign-in
- **Preserved** across sign-out (so settings are restored when the user signs back in)
- **Not deleted** on sign-out — only on explicit account deletion

### Location & Live Data on Restore

After session restore or sign-in, the app automatically calls `Location.getForegroundPermissionsAsync()`. If the user previously granted location access, it silently re-fetches the current position and triggers a fresh UV + weather API load. This ensures returning users always see live data, not mock defaults.

---

## Navigation Flow

```
Splash (2.4 s min + session restore complete)
  ├─ authenticated + onboarding done → MainTabs
  └─ otherwise → AuthLanding
       ├─ Create Account → SignUp → OnboardingWelcome
       ├─ Sign In → SignIn → MainTabs
       └─ Guest → OnboardingWelcome
                    └─ … → OnboardingSkin → OnboardingSunscreen
                             └─ LocationPermission → MainTabs (replace)

MainTabs (bottom nav: Home ⊙ / Forecast ◈ / Insights ✦ / History ◷ / Profile ◉)
  ├─ HomeTab stack:    Home → ExposureActive → SunscreenAlert
  └─ ProfileTab stack: Profile → Settings / Premium
```

---

## Global State (`AppState.tsx`)

All shared state lives in a single React Context.

### Auth Slices
| Slice | Type | Notes |
|---|---|---|
| `user` | `AuthUser \| null` | Null until session restored or sign-in completes |
| `authLoading` | `boolean` | True during session restore and auth operations |
| `authError` | `string \| null` | Human-friendly error message from last failed auth call |
| `isAuthenticated` | `boolean` | Computed: `user !== null` |
| `onboardingComplete` | `boolean` | Persisted to AsyncStorage via profileStore |

### Auth Actions
| Action | Behaviour |
|---|---|
| `signIn(params)` | Calls Parse, loads persisted profile, triggers location + live data fetch |
| `signUp(params)` | Creates Parse user, seeds profile, saves to AsyncStorage |
| `signOut()` | Calls Parse logOut, clears SecureStore token, resets in-memory state |
| `restoreSession()` | Reads SecureStore token → `become()` → loads profile → fetches live data |
| `requestPasswordReset(email)` | Sends Back4App password reset email |

### Other State Slices
| Slice | Type | Notes |
|---|---|---|
| `profile` | `UserProfile` | skinType, defaultSpf, reapplyReminder, waterExposure — auto-persisted |
| `timer` | `TimerState` | totalSeconds, secondsLeft, isRunning, isPaused |
| `uvData` | `UVData` | Full OpenUV response, pre-seeded with mock |
| `weatherData` | `WeatherData` | OpenWeatherMap response, pre-seeded with mock |
| `currentUV` | `number` | Alias for `uvData.uv` |
| `liveDataStatus` | `'idle' \| 'loading' \| 'success' \| 'error'` | |
| `location` | `LocationObjectCoords \| null` | GPS coords from expo-location |
| `budgetUsedPct` | `number` | 0–1 fraction of daily solar budget consumed |

---

## Environment Setup

### Back4App

1. Create an app at [back4app.com](https://www.back4app.com)
2. Go to **App Settings → Security & Keys**
3. Copy your Application ID and JavaScript Key

### API Keys

Create a `.env` file at the project root:

```env
# Back4App (required for auth)
EXPO_PUBLIC_BACK4APP_APP_ID=your_application_id
EXPO_PUBLIC_BACK4APP_JS_KEY=your_javascript_key
EXPO_PUBLIC_BACK4APP_SERVER_URL=https://parseapi.back4app.com

# UV data (optional — mock data used if absent)
EXPO_PUBLIC_OPENUV_API_KEY=your_openuv_key

# Weather data (optional — mock data used if absent)
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
```

All UV and weather keys are optional during development — mock data is used automatically when keys are absent or set to placeholder values. New OpenWeatherMap keys can take up to 2 hours to activate.

---

## Service Layer

### `authService.ts` — Back4App Authentication
```ts
await signUp({ name, email, password });
await signIn({ email, password });
await signOut();
const user = await restoreSession(); // returns AuthUser | null
await requestPasswordReset(email);
```

### `profileStore.ts` — Profile Persistence
```ts
await saveProfile(userId, { profile, onboardingComplete });
const data = await loadProfile(userId); // returns PersistedUserData | null
await deleteProfile(userId);
```

### `uvService.ts` — OpenUV API
```ts
const uvData = await fetchCurrentUV(lat, lon, alt);
const forecast = await fetchHourlyForecast(lat, lon, alt);
```

### `weatherService.ts` — OpenWeatherMap
```ts
const weather = await fetchCurrentWeather(lat, lon, 'metric');
```

### `historyService.ts` — AsyncStorage Exposure History
```ts
const history = await loadHistory();
await saveTodayExposure({ minutes, peakUV, spfUsed, budgetPct });
const { weeklyData, labels } = await loadWeeklyChartData();
await clearHistory();
```

---

## Development Tips

**Bypass auth/onboarding during development:**

In `src/state/AppState.tsx`, temporarily set initial values:
```ts
const [isAuthenticated] = useState(true);   // skip auth
const [onboardingComplete] = useState(true); // skip onboarding
```

Or sign in once and let session persistence handle it — the session survives Expo Go reloads.

**Clear Metro cache:**
```bash
npx expo start --clear
```

**API usage note:**

Each app open triggers one OpenUV request and one OpenWeatherMap request (when location permission is granted). OpenUV free tier allows 250 requests/day. Consider adding a 30-minute cache window in `profileStore` if you need to reduce API usage at scale.

---

## Key Learnings & Gotchas

- **Parse + Expo Go reload:** `parse/react-native` with `setAsyncStorage` calls server-side `logOut()` on JS bundle reload due to session state mismatch. Fix: clear Parse's user cache from AsyncStorage immediately after `Parse.initialize()` and use `expo-secure-store` + `Parse.User.become(token)` for session persistence instead.
- **Live data on restore:** `location` is plain React state and resets to `null` on every JS reload. Always call `Location.getForegroundPermissionsAsync()` after session restore to re-fetch coordinates and trigger live UV/weather loads.
- **Expo SDK version** must align with the installed Expo Go app on device. Mismatches cause `TurboModuleRegistry PlatformConstants` runtime errors.
- **`app.json` plugins** must be kept minimal (empty array or only valid plugins). Invalid entries cause launch failures.
- **`package.json` main entry** must be `node_modules/expo/AppEntry.js`, not `expo-router/entry`.
- **`GestureHandlerRootView` and `AppProvider`** are required wrappers in `App.tsx`.
- **`babel-preset-expo`** must be a persistent `dependency`, not just a `devDependency`.
- **Parse initialization order:** `Parse.setAsyncStorage()` must be called before `Parse.initialize()`.

---

## Roadmap

- [ ] Plug in real API keys (OpenUV + OpenWeatherMap)
- [ ] Push notifications via `expo-notifications`
- [ ] In-app purchases via RevenueCat
- [ ] API response caching (30-minute TTL) to reduce OpenUV usage
- [ ] EAS Build configuration for production
- [ ] App Store Connect setup (privacy policy, app icon assets, App Privacy questionnaire)

---

## Dependencies

| Package | Purpose |
|---|---|
| `expo` ~54.0 | Build toolchain |
| `parse` | Back4App / Parse Platform SDK |
| `expo-secure-store` | Session token storage (iOS Keychain / Android Keystore) |
| `expo-linear-gradient` | Button + hero gradients |
| `expo-location` | GPS coordinates |
| `expo-haptics` | Haptic feedback |
| `expo-blur` | Blur effects |
| `react-native-svg` | Circular timer ring |
| `@react-navigation/native` | Screen routing |
| `@react-navigation/native-stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Bottom tab bar |
| `react-native-reanimated` | Smooth animations |
| `react-native-safe-area-context` | Safe area handling |
| `react-native-gesture-handler` | Gesture support (required root wrapper) |
| `@react-native-async-storage/async-storage` | Profile + exposure history persistence |
| `@types/parse` | TypeScript types for Parse SDK |

---

*UI spec: Dermis UI Design Specification v1.0 — March 2026. Do not deviate without versioning.*
