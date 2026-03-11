# ☀ Dermis — UV & Skin Guardian

> A production-ready Expo React Native app for real-time UV tracking, personalized safe exposure timing, and sun safety guidance. Built to spec against the frozen Dermis UI v1.0.

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
| Storage | @react-native-async-storage/async-storage |
| UV API | OpenUV (`/api/v1/uv`, `/api/v1/forecast`) |
| Weather API | OpenWeatherMap Current Weather 2.5 |
| Gestures | react-native-gesture-handler |
| Dev Environment | VS Code, MacBook Air, Expo Go on iPhone |

---

## Project Structure

```
dermis/
├── App.tsx                        # Root — GestureHandlerRootView + AppProvider + AppNavigator
├── app.json                       # Expo config (SDK 54, bundle ID: com.dermis.app)
├── babel.config.js
├── tsconfig.json
└── src/
    ├── theme/
    │   └── tokens.ts              # ★ Single source of truth for all design tokens
    ├── data/
    │   └── mockData.ts            # All mock data + TypeScript types (UVData, WeatherData, etc.)
    ├── state/
    │   └── AppState.tsx           # React Context — timer, profile, live UV/weather, location
    ├── services/
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
| `SplashScreen` | Animated brand loading screen, auto-advances after 2.4 s |
| `AuthLandingScreen` | Entry point — Create Account / Sign In / Guest CTAs |
| `SignUpScreen` | Full registration form with Apple / Google SSO |
| `SignInScreen` | Email + password login with Apple / Google SSO |
| `ForgotPasswordScreen` | Email reset form with inline confirmation state |

### Onboarding Group (4 screens)
| Screen | Description |
|---|---|
| `OnboardingWelcomeScreen` | Feature highlights carousel |
| `OnboardingSkinScreen` | Fitzpatrick scale card selector (6 skin types) |
| `OnboardingSunscreenScreen` | SPF chip picker + reapply reminder + water toggle |
| `LocationPermissionScreen` | GPS prompt — calls `expo-location`, stores coords in global state |

### Main Group (9 screens)
| Screen | Description |
|---|---|
| `HomeScreen` | UV card + circular exposure timer + solar budget + quick insights |
| `ExposureActiveScreen` | Full-screen countdown mode with pause / end controls |
| `SunscreenAlertScreen` | Reapply modal — resets SPF timer on confirm |
| `ForecastScreen` | Bar chart of today's hourly UV + hourly breakdown list |
| `InsightsScreen` | Scrollable educational card feed (6 science-backed articles) |
| `HistoryScreen` | Weekly bar chart + stats row + daily exposure log |
| `ProfileScreen` | User account details and skin profile |
| `SettingsScreen` | Notifications, location, units, data sources, privacy |
| `PremiumScreen` | Dermis Pro upsell with feature list and purchase CTA |

---

## Navigation Flow

```
Splash (2.4 s)
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

All shared state lives in a single React Context. Key slices:

| Slice | Type | Notes |
|---|---|---|
| `isAuthenticated` | `boolean` | Set `true` in dev to bypass auth flow |
| `onboardingComplete` | `boolean` | Set `true` in dev to skip onboarding |
| `profile` | `UserProfile` | skinType, defaultSpf, reapplyReminder, waterExposure |
| `timer` | `TimerState` | totalSeconds, secondsLeft, isRunning, isPaused |
| `uvData` | `UVData` | Full OpenUV response, pre-seeded with mock |
| `weatherData` | `WeatherData` | OpenWeatherMap response, pre-seeded with mock |
| `currentUV` | `number` | Alias for `uvData.uv` |
| `liveDataStatus` | `'idle' \| 'loading' \| 'success' \| 'error'` | |
| `location` | `LocationObjectCoords \| null` | GPS coords from expo-location |
| `budgetUsedPct` | `number` | 0–1 fraction of daily solar budget consumed |

### Timer Logic
- Timer total is calculated via `calcSafeExposureSeconds(skinType, spf, uvData)` using the Fitzpatrick × SPF × live UV formula in `src/utils/timerCalc.ts`.
- When live UV arrives mid-session, `rescaleSecondsLeft()` preserves the arc's fractional progress without a jarring jump.
- `resetTimer()` automatically calls `saveTodayExposure()` to persist completed sessions to AsyncStorage.

---

## Service Layer

All three services fall back gracefully to mock data when API keys are absent or requests fail — the UI is never broken during development.

### `uvService.ts` — OpenUV API
```ts
// Set in .env:
EXPO_PUBLIC_OPENUV_API_KEY=your_key_here

// Usage:
const uvData = await fetchCurrentUV(lat, lon, alt);
const forecast = await fetchHourlyForecast(lat, lon, alt);
```

### `weatherService.ts` — OpenWeatherMap
```ts
// Set in .env:
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here

// Usage:
const weather = await fetchCurrentWeather(lat, lon, 'metric');
```
> New OpenWeatherMap keys can take up to 2 hours to activate.

### `historyService.ts` — AsyncStorage
```ts
const history = await loadHistory();
await saveTodayExposure({ minutes, peakUV, spfUsed, budgetPct });
const { weeklyData, labels } = await loadWeeklyChartData();
await clearHistory(); // on sign-out
```

---

## Environment Setup

Create a `.env` file at the project root:

```env
EXPO_PUBLIC_OPENUV_API_KEY=your_openuv_key
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
```

Both keys are optional during development — mock data is used automatically when keys are absent or set to placeholder values.

---

## Design Tokens

All visual constants live in `src/theme/tokens.ts`:

| Category | Key exports |
|---|---|
| Colors | `Colors.navy`, `Colors.teal`, `Colors.amber`, etc. |
| UV risk mapping | `uvColor(n)`, `uvLabel(n)` |
| Typography | `FontSizes.*`, `FontWeights.*` |
| Spacing (4pt grid) | `Spacing.*` |
| Border radii | `Radii.*` |
| Gradients | `Gradients.primary`, `Gradients.gold`, etc. |
| Shadows | `Shadows.card`, `Shadows.glow(color)` |
| Layout constants | `Layout.cardPadding`, `Layout.buttonRadius`, etc. |

---

## Development Tips

**Bypass auth/onboarding during development:**

In `src/state/AppState.tsx`, temporarily flip the initial values:
```ts
const [isAuthenticated,    setIsAuthenticated]    = useState(true);
const [onboardingComplete, setOnboardingComplete] = useState(true);
```

**Jump to any screen:**

The `DevScreenPicker` component provides a pill-button nav bar grouping all 18 screens by Auth / Onboarding / Main. It can be wired into `App.tsx` when you need direct screen access during development.

**Clear Metro cache:**
```bash
npx expo start --clear
```

---

## Key Learnings & Gotchas

- **Expo SDK version** must align with the installed Expo Go app on device. Mismatches cause `TurboModuleRegistry PlatformConstants` runtime errors. When versions are deeply misaligned, `npx create-expo-app` + source migration is the cleanest fix.
- **`app.json` plugins** must be kept minimal (empty array or only valid plugins). Invalid entries like `expo-router` or `expo-build-properties` cause launch failures.
- **`package.json` main entry** must be `node_modules/expo/AppEntry.js`, not `expo-router/entry`.
- **`GestureHandlerRootView` and `AppProvider`** are required wrappers in `App.tsx` — omitting them causes `useAppState must be used within AppProvider` at runtime.
- **`babel-preset-expo`** must be a persistent `dependency`, not just a `devDependency`.

---

## Roadmap

- [ ] Plug in real API keys (OpenUV + OpenWeatherMap)
- [ ] Supabase authentication backend
- [ ] Push notifications via `expo-notifications`
- [ ] In-app purchases via RevenueCat
- [ ] EAS Build configuration for production
- [ ] App Store Connect setup (privacy policy, app icon assets, App Privacy questionnaire)

---

## Dependencies

| Package | Purpose |
|---|---|
| `expo` ~54.0 | Build toolchain |
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
| `@react-native-async-storage/async-storage` | Local exposure history |

---

*UI spec: Dermis UI Design Specification v1.0 — March 2026. Do not deviate without versioning.*
